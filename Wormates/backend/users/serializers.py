from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, WebPageSettings, Notification, PersonalReaderSettings, ReadingProgress, \
    NotificationSettings, WalletTransaction, UserMainPageSettings
from store.models import Book, Genre, Series, Comment, BookUpvote, Review
from .helpers import FollowerHelper
from django.utils.formats import date_format
from django.utils import timezone
from datetime import timedelta, date
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import re
import random


# serializers.py
class CustomUserRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    dob_month = serializers.IntegerField(write_only=True, required=True)
    dob_year = serializers.IntegerField(write_only=True, required=True)

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password should contain minimum 8 symbols and capital letter")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password should contain minimum 8 symbols and capital letter")
        return value

    def validate(self, data):
        errors = {}
        if User.objects.filter(email=data['email']).exists():
            errors['email'] = 'That email is already taken'
        if data['password'] != data['password2']:
            errors['password2'] = 'Passwords does not match'
        if data['dob_month'] < 1 or data['dob_month'] > 12:
            errors['dob_month'] = 'That month does not exist'
        current_year = timezone.now().year
        if data['dob_year'] > current_year or data['dob_year'] < (current_year - 100):
            errors['dob_year'] = 'Invalid year'
        if errors:
            raise serializers.ValidationError(errors)
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        dob_month = validated_data.pop('dob_month')
        dob_year = validated_data.pop('dob_year')

        email = validated_data['email']
        base_username = email.split('@')[0]

        def generate_random_suffix():
            return str(random.randint(1000, 9999))

        username = f"{base_username}{generate_random_suffix()}"

        attempts = 0
        max_attempts = 10
        while User.objects.filter(username=username).exists() and attempts < max_attempts:
            username = f"{base_username}{generate_random_suffix()}"
            attempts += 1

        if attempts == max_attempts:
            raise serializers.ValidationError("Failed to generate unique username, try again.")

        user = User(
            username=username,
            email=email,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=False
        )
        user.set_password(password)
        user.save()

        return user


class CustomUserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})


class UserSerializer(serializers.ModelSerializer):
    profile_img = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_img']

    def get_profile_img(self, obj):
        if obj.profile.profileimg:
            request = self.context.get('request')
            profile_img_url = obj.profile.profileimg.url
            return request.build_absolute_uri(profile_img_url) if request else profile_img_url
        return None


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    unread_notification_count = serializers.IntegerField(read_only=True)
    books_count = serializers.SerializerMethodField()
    series_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'user',
            'about',
            'profileimg',
            'unread_notification_count',
            'banner_image',
            'books_count',
            'series_count',
            'followers_count',
            'following_count',
        ]
        read_only_fields = ('user',)

    def create(self, validated_data):
        # Custom creation logic if needed
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Custom update logic if needed
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # If the last name is not provided, you can choose to omit it or return an empty string
        representation['user']['last_name'] = representation['user'].get('last_name', '')
        return representation

    def get_books_count(self, obj):
        # Assuming the related_name for books in User model is 'authored_books'
        return obj.user.authored_books.count()

    def get_series_count(self, obj):
        # Assuming the related_name for series in User model is 'authored_series'
        return obj.user.authored_series.count()

    def get_followers_count(self, obj):
        return FollowerHelper.get_followers_count(obj.user)

    def get_following_count(self, obj):
        return FollowerHelper.get_following_count(obj.user)


class LibraryBookSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    genre = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Genre.objects.all()
    )
    subgenres = serializers.StringRelatedField(many=True)
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()
    view_set = serializers.SerializerMethodField()

    def get_view_set(self, obj):
        # Получаем library из контекста
        library = self.context.get('library', None)
        if library:
            return library.view_set
        return False

    def get_upvotes(self, obj):
        return obj.upvote_count()

    def get_downvotes(self, obj):
        return obj.downvote_count()

    class Meta:
        model = Book
        fields = [
            'id',
            'name',
            'coverpage',
            'author',
            'genre',
            'subgenres',
            'volume_number',
            'upvotes',
            'downvotes',
            'view_set'
        ]


class AuthoredBookSerializer(serializers.ModelSerializer):
   # like_count = serializers.IntegerField(read_only=True)
   upvote_count = serializers.SerializerMethodField()
   author = serializers.StringRelatedField()
   series = serializers.StringRelatedField()
   formatted_last_modified = serializers.SerializerMethodField()

   def get_formatted_last_modified(self, obj):
       return obj.last_modified.strftime('%m/%d/%Y')

   #   def get_formatted_last_modified(self, obj):
#       return obj.last_modified.strftime('%d/%m/%Y')        Как вариант можно так
   def get_upvote_count(self, obj):
       return obj.upvotes.count()


   class Meta:
        model = Book
        fields = ['id', 'name', 'genre', 'subgenres', 'coverpage', 'rating', 'views_count', 'formatted_last_modified', 'series',
                  'volume_number', 'status', 'description', 'author', 'upvote_count']


class SeriesSerializer(serializers.ModelSerializer):
    books = AuthoredBookSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = ['id', 'name', 'books']


class ParentCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # This will return the string representation of the user.

    class Meta:
        model = Comment
        fields = ['id', 'user']


class CommentSerializer(serializers.ModelSerializer):
    parent_comment = ParentCommentSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    name = serializers.CharField(source='book.name', read_only=True)
    formatted_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'book', 'name', 'text', 'formatted_timestamp', 'parent_comment', 'replies']
        # Во фронте добавить типа, if parent_comment is null : use book

    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime('%m/%d/%Y %H:%M')  # Formats the timestamp

    def get_parent_comment(self, obj):
        # This will serialize the parent comment if it exists
        if obj.parent_comment:
            return CommentSerializer(obj.parent_comment).data
        return None

    def get_replies(self, obj):
        # Recursive serialization to fetch replies to a comment
        if obj.replies.all().exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


class ReviewSerializer(serializers.ModelSerializer):
    formatted_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'book', 'text', 'created', 'views_count', 'last_viewed', 'rating', 'formatted_timestamp']

    def get_formatted_timestamp(self, obj):
        time_difference = timezone.now() - obj.created
        if time_difference < timedelta(seconds=60):
            return "just now"
        elif time_difference < timedelta(minutes=60):
            return f"{time_difference.seconds // 60} minutes ago"
        elif time_difference < timedelta(days=1):
            return f"{time_difference.seconds // 3600} hours ago"
        elif time_difference < timedelta(weeks=1):
            return f"{time_difference.days} days ago"
        else:
            return obj.created.strftime('%d.%m.%Y')


'''class CustomUserSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'id')


class CustomProfileSerializer(serializers.ModelSerializer):
    profileimg = serializers.ImageField(required=False)  # Allow non-required upload
    banner_image = serializers.ImageField(required=False)  # Allow non-required upload

    class Meta:
        model = Profile
        fields = ('id', 'about', 'profileimg', 'banner_image')


class WebPageSettingsSerializer(serializers.ModelSerializer):
    profile = CustomProfileSerializer()

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile_serializer = CustomProfileSerializer(instance.profile, data=profile_data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
        else:
            raise serializers.ValidationError(profile_serializer.errors)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    class Meta:
        model = WebPageSettings
        fields = ('profile', 'display_dob_option', 'gender', 'date_of_birth')'''


class UserProfileSettingsSerializer(serializers.Serializer):
    # Поля из модели User
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    # Поля из модели WebPageSettings
    date_of_birth_day = serializers.IntegerField(required=False, allow_null=True)
    date_of_birth_month = serializers.IntegerField(required=False, allow_null=True)
    date_of_birth_year = serializers.IntegerField(required=False, allow_null=True)
    display_dob_option = serializers.IntegerField(required=False)
    gender = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        # Обновляем поля модели User
        user = instance.profile.user
        user.first_name = validated_data.get('first_name', user.first_name)
        user.last_name = validated_data.get('last_name', user.last_name)
        user.save()

        # Обновляем поля модели WebPageSettings
        day = validated_data.get('date_of_birth_day')
        month = validated_data.get('date_of_birth_month')
        year = validated_data.get('date_of_birth_year')

        if day and month and year:
            try:
                instance.date_of_birth = date(year=int(year), month=int(month), day=int(day))
            except ValueError:
                raise serializers.ValidationError("Invalid date of birth.")

        display_dob_option = validated_data.get('display_dob_option')
        if display_dob_option is not None:
            instance.display_dob_option = display_dob_option

        gender = validated_data.get('gender')
        if gender is not None:
            instance.gender = gender

        instance.save()

        return instance

    def to_representation(self, instance):
        user = instance.profile.user
        profile = instance.profile
        dob = instance.date_of_birth
        data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profileimg': profile.profileimg.url if profile.profileimg else None,
            'banner_image': profile.banner_image.url if profile.banner_image else None,
            'date_of_birth_day': dob.day if dob else None,
            'date_of_birth_month': dob.month if dob else None,
            'date_of_birth_year': dob.year if dob else None,
            'display_dob_option': instance.display_dob_option,
            'gender': instance.gender,
        }
        return data


class PrivacySettingsSerializer(serializers.ModelSerializer):
    current_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Profile
        fields = ('auto_add_reading', 'library_visibility', 'current_email')


'''class EmailChangeSerializer(serializers.Serializer):           # Закомментил возможность менять эмейл
    verification_code = serializers.CharField(required=True)
    new_email = serializers.EmailField(required=True)

    def validate(self, data):
        user = self.context['request'].user
        verification_instance = EmailVerification.objects.get(user=user, verification_type='email_change')

        if verification_instance.verification_code != data['verification_code']:
            raise serializers.ValidationError("Invalid verification code.")

        if user.email == data['new_email']:
            raise serializers.ValidationError("New email is the same as the current email.")

        if verification_instance.verified:
            raise serializers.ValidationError("Verification code already used.")

        return data
'''


class PasswordChangeRequestSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data['current_password']):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        return data


class NotificationSerializer(serializers.ModelSerializer):
    formatted_timestamp = serializers.SerializerMethodField()
    book_name = serializers.CharField(source='book.name', read_only=True)
    message = serializers.CharField(read_only=True)

    def get_formatted_timestamp(self, obj):
        from django.utils import timezone
        from datetime import timedelta

        time_difference = timezone.now() - obj.timestamp
        if time_difference < timedelta(minutes=1):
            return "just now"
        elif time_difference < timedelta(hours=1):
            return f"{time_difference.seconds // 60} minutes ago"
        elif time_difference < timedelta(days=1):
            return f"{time_difference.seconds // 3600} hours ago"
        elif time_difference < timedelta(days=30):
            return f"{time_difference.days} days ago"
        elif time_difference < timedelta(days=365):
            months = time_difference.days // 30
            return f"{months} months ago" if months > 1 else "1 month ago"
        else:
            years = time_difference.days // 365
            return f"{years} years ago" if years > 1 else "1 year ago"

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'notification_type', 'read', 'formatted_timestamp',
                  'chapter_title', 'message', 'book_name']


class NotificationSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'chapter_notification_threshold',
            'group_by_author',
            'show_author_updates',
            'newbooks',
            'library_reading_updates',
            'library_wishlist_updates',
            'library_liked_updates',
            'library_favourite_updates',
            'show_review_updates',
            'show_comment_updates',
            'show_follower_updates',
            'show_response_updates',
        ]


class ProfileDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['description']


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['amount', 'transaction_type', 'timestamp', 'related_purchase']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        return token


class FollowSerializer(serializers.Serializer):
    def validate(self, data):
        follower = self.context['request'].user
        user_username = self.context['view'].kwargs.get('username')
        try:
            user = User.objects.get(username=user_username)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")

        if follower == user:
            raise serializers.ValidationError("You cannot follow yourself")

        return {'follower': follower, 'user': user}

    def create(self, validated_data):
        follower = validated_data['follower']
        user = validated_data['user']

        if FollowerHelper.is_following(follower, user):
            FollowerHelper.unfollow(follower, user)
        else:
            FollowerHelper.follow(follower, user)
        return {'follower': follower, 'user': user}


class PersonalReaderSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalReaderSettings
        fields = '__all__'
        read_only_fields = ('user',)


class ReadingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = '__all__'


class UserMainPageSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMainPageSettings
        fields = [
            'main_page_theme',
            'show_first_books',
            'show_only_free_books',
            'restricted_mode',
            'view_mode',
        ]


class PasswordChangeVerificationSerializer(serializers.Serializer):
    verification_code = serializers.CharField(max_length=6, required=True)

    def validate_verification_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Invalid verification code.")
        return value
