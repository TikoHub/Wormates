import datetime
from django.dispatch import receiver
from django.utils import timezone
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.core.validators import FileExtensionValidator


class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='achievement_images')

    def __str__(self):
        return self.name


class VerificationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=10)


class Notification(models.Model):
    # Define types of notifications
    TYPE_CHOICES = (
        ('like', 'Like'),
        ('comment reply', 'Comment reply'),
        ('new follower', 'New Follower'),
        ('review_update', 'Review Update'),
        ('book_update', 'Book Update'),
        ('author_update', 'Author Update'),
        ('new comment', 'New Comment'),
        ('new_ebook', 'New Ebook'),
    )

    recipient = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    book = models.ForeignKey('store.Book', on_delete=models.SET_NULL, null=True, blank=True, related_name='user_book_preference_notification')
    book_name = models.CharField(max_length=255, blank=True, null=True)
    chapter_title = models.CharField(max_length=255, blank=True, null=True)
    chapter = models.ForeignKey('store.Chapter', on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.message:
                self.message = self.get_message()
        super().save(*args, **kwargs)

    def get_message(self):
        username = self.sender.user.username if self.sender else "Someone"
        book_name = self.book.name if self.book else "a book"

        messages = {
            'like': f"{username} liked your book {book_name}",
            'follow': f"{username} followed you",
            'comment reply': f"{username} replied to your comment",
            'new comment': f"{username} commented on your book {book_name}",
            'book_update': f"New update in {book_name}",
            'new_ebook': f"New Ebook: {book_name}",
            'review_update': f"{username} reviewed your book {book_name}",
        }

        return messages.get(self.notification_type, "")


class NotificationSettings(models.Model):
    CHAPTER_NOTIFICATION_CHOICES = [
        (1, '1 Chapter'),
        (3, '3 Chapters'),
        (5, '5 Chapters'),
        (10, '10 Chapters'),
        (30, '30 Chapters'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    chapter_notification_threshold = models.IntegerField(default=1, choices=CHAPTER_NOTIFICATION_CHOICES)

    group_by_author = models.BooleanField(default=True)
    show_author_updates = models.BooleanField(default=True)
    newbooks = models.BooleanField(default=False)
    library_reading_updates = models.BooleanField(default=True)
    library_wishlist_updates = models.BooleanField(default=True)
    library_liked_updates = models.BooleanField(default=True)
    library_favourite_updates = models.BooleanField(default=False)
    show_review_updates = models.BooleanField(default=True)
    show_comment_updates = models.BooleanField(default=True)
    show_follower_updates = models.BooleanField(default=True)
    show_response_updates = models.BooleanField(default=True)


class UserBookChapterNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chapter_notifications')
    book = models.ForeignKey('store.Book', on_delete=models.CASCADE, related_name='chapter_notifications')
    last_notified_chapter_count = models.PositiveIntegerField(default=0)
    chapter_count_at_last_notification = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'book')


class Profile(models.Model):
    TIER_CHOICES = (
        ('normal', 'Normal'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    about = models.CharField(max_length=500, blank=True)
    profileimg = models.ImageField(upload_to='profile_images', default='blank-profile-picture.png')
    bookmarks = models.ManyToManyField('store.Review', related_name='bookmark_profiles', blank=True)
    achievements = models.ManyToManyField(Achievement, blank=True)
    blacklist = models.ManyToManyField(User, related_name="blacklisted_by", blank=True)
    auto_add_reading = models.BooleanField(default=True)
    description = models.CharField(max_length=1000, blank=True, null=True) # Не уверен что мне этот метод нравится
    record_history = models.BooleanField(default=True)
    tos_accepted = models.BooleanField(default=False)
    banner_image = models.ImageField(
        upload_to='banner_images',
        default='default_banner.png',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])]
    )

    LIBRARY_VISIBILITY_CHOICES = (
        ('private', 'Private'),
        ('followers', 'Followers'),
        ('everyone', 'Everyone'),
    )
    library_visibility = models.CharField(
        max_length=10,
        choices=LIBRARY_VISIBILITY_CHOICES,
        default='everyone'
    )
    tier = models.CharField(
        max_length=15,
        choices=TIER_CHOICES,
        default='normal'
    )

    def unread_notification_count(self):
        return self.notifications.filter(read=False).count()

    def __str__(self):
        return self.user.username


class FollowersCount(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_users')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_users')

    def __str__(self):
        return f"{self.follower.username} follows {self.user.username}"


class Library(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='library')
    reading_books = models.ManyToManyField('store.Book', related_name='reading_users', blank=True)
    liked_books = models.ManyToManyField('store.Book', related_name='liked_users', blank=True)
    wish_list_books = models.ManyToManyField('store.Book', related_name='wishlist_users', blank=True)
    favorites_books = models.ManyToManyField('store.Book', related_name='favorites_users', blank=True)
    finished_books = models.ManyToManyField('store.Book', related_name='finished_users', blank=True)
    purchased_books = models.ManyToManyField('store.Book', related_name='purchased_by_users', through='PurchasedBook', blank=True)

    view_set = models.BooleanField(default=False) #Отображение в кол-ве книг

    def __str__(self):
        return f"Library - {self.user.username}"

    def get_all_books(self):
        # Adjust this method if you want to include all categories
        return (self.reading_books.all() | self.liked_books.all() |
                self.wish_list_books.all() | self.favorites_books.all() |
                self.finished_books.all()).distinct()


class PurchasedBook(models.Model):
    library = models.ForeignKey(Library, on_delete=models.CASCADE)
    book = models.ForeignKey('store.Book', on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('library', 'book')


class Wallet(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.profile.user.username}'s Wallet"

    def deposit(self, amount):
        # Convert the amount to Decimal
        amount = Decimal(amount)
        self.balance += amount
        self.save()
        WalletTransaction.objects.create(wallet=self, amount=amount, transaction_type='deposit')

    def withdraw(self, amount):
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            WalletTransaction.objects.create(wallet=self, amount=amount, transaction_type='withdraw')
            return True
        return False

    def purchase(self, book, amount):
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            WalletTransaction.objects.create(wallet=self, amount=amount, transaction_type='purchase',
                                             related_purchase=book)
            return True
        return False


class WalletTransaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=[('deposit', 'Deposit'), ('withdraw', 'Withdraw'), ('purchase', 'Purchase')])
    timestamp = models.DateTimeField(auto_now_add=True)
    related_purchase = models.ForeignKey('store.Book', null=True, blank=True, on_delete=models.SET_NULL)  # Only for purchase transactions

    def __str__(self):
        return f"{self.wallet.profile.user.username} - {self.transaction_type} - {self.amount}"


class Trailer(models.Model):
    link = models.URLField(max_length=200)


class WebPageSettings(models.Model):
    DOB_CHOICES = (
        (0, 'No One'),
        (1, 'Friends Only'),
        (2, 'Everyone'),
    )
    GENDER_CHOICES = (
        ('not_specified', 'Not Specified'),
        ('female', 'Female'),
        ('male', 'Male'),
        ('other', 'Other'),
    )

    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    display_dob_option = models.IntegerField(choices=DOB_CHOICES, default=1)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(
        max_length=15,
        choices=GENDER_CHOICES,
        default='not_specified',
        blank=True
    )

    def __str__(self):
        return self.profile.user.username


class Conversation(models.Model):
    participants = models.ManyToManyField(User)

    def __str__(self):
        return ", ".join([str(p) for p in self.participants.all()])

    def get_other_user(self, user):
        return self.participants.exclude(id=user.id).first()


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE, null=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return self.text


class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    verification_code = models.CharField(max_length=6)
    verified = models.BooleanField(default=False)


class StripeCustomer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)


@receiver(post_save, sender=User)
def create_user_payment(sender, instance, created, **kwargs):
    if created:
        StripeCustomer.objects.create(user=instance)


class PersonalReaderSettings(models.Model):
    THEME_CHOICES = (
        ('dark', 'Dark'),
        ('light', 'Light'),
        ('sepia', 'Sepia'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='reader_settings')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='sepia')
    font_size = models.IntegerField(default=1)
    line_height = models.IntegerField(default=1)  # Процентное значение, например, 150%
    text_position = models.IntegerField(default=1)  # Может представлять положение прокрутки или номер страницы
    font_weight = models.IntegerField(default=1)  # Значения от 100 до 900
    font = models.IntegerField(default=1)  # Или IntegerField, если шрифты кодируются числами

    def __str__(self):
        return f"{self.user.username}'s Reader Settings"


class ReadingProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_progress')
    book = models.ForeignKey('store.Book', on_delete=models.CASCADE)
    last_page = models.IntegerField(default=1)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.username}'s progress on {self.book.name}"


class UserMainPageSettings(models.Model):
    THEME_CHOICES = [
        ('default_theme', 'Default Theme'),
        ('white_theme', 'White Theme'),
    ]

    VIEW_MODE_CHOICES = [
        ('horizontal', 'Horizontal'),
        ('vertical', 'Vertical'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='main_page_settings')
    main_page_theme = models.CharField(max_length=100, choices=THEME_CHOICES, default='default_theme')
    show_first_books = models.BooleanField(default=False)
    show_only_free_books = models.BooleanField(default=False)
    restricted_mode = models.BooleanField(default=False)
    view_mode = models.CharField(max_length=10, choices=VIEW_MODE_CHOICES, default='horizontal')

    def __str__(self):
        return f"Main Page Settings for {self.user.username}"


class PasswordChangeRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_change_requests')
    verification_code = models.CharField(max_length=6)
    hashed_new_password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Password change request for {self.user.username}"
