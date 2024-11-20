from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import CommentLike, CommentDislike, Review, Comment, Book, Chapter
from users.models import Notification, NotificationSettings
from django.contrib.auth.models import User
from django.db.models import Max
from users.views import notify_users_of_new_chapter

from users.notification_utils import send_book_update_notifications


@receiver(post_save, sender=CommentLike)
@receiver(post_save, sender=CommentDislike)
@receiver(post_delete, sender=CommentLike)
@receiver(post_delete, sender=CommentDislike)
def update_comment_rating(sender, instance, **kwargs):
    instance.comment.update_rating()


@receiver(post_save, sender=Review)
def send_review_notification(sender, instance, created, **kwargs):
    if created:
        book_author = instance.book.author
        author_settings = NotificationSettings.objects.get(user=book_author)

        # Send notification based on the author's settings
        # and make sure the sender is not the recipient
        if author_settings.show_review_updates and instance.author.profile != book_author.profile:
            Notification.objects.create(
                recipient=book_author.profile,
                sender=instance.author.profile,
                notification_type='review_update',
                book=instance.book
            )


@receiver(post_save, sender=Comment)
def send_comment_notification(sender, instance, created, **kwargs):
    if created:
        book_author = instance.book.author
        author_settings = NotificationSettings.objects.get(user=book_author)

        # Check if the comment is a reply
        if instance.parent_comment:
            notification_type = 'comment reply'
            recipient = instance.parent_comment.user.profile
        else:
            notification_type = 'new comment'
            recipient = book_author.profile

        # Send notification based on the author's settings
        if author_settings.show_comment_updates and instance.user.profile != recipient:
            Notification.objects.create(
                recipient=recipient,
                sender=instance.user.profile,
                notification_type=notification_type,
                book=instance.book
            )


@receiver(post_save, sender=Book)
def book_update_notification(sender, instance, created, **kwargs):
    if not created:
        # Здесь вы можете добавить условия, при которых нужно отправлять уведомления
        latest_chapter = instance.chapters.order_by('-created').first()
        if latest_chapter and latest_chapter.published:
            chapter_title = latest_chapter.title
            send_book_update_notifications(instance, chapter_title)


@receiver(post_save, sender=Book)
def notify_new_book_release(sender, instance, created, **kwargs):
    if created and instance.visibility == 'public' and instance.genre.name != 'Undefined':
        existing_user = User.objects.get(username='wormates')
        users = User.objects.filter(notification_settings__newbooks=True)
        notifications = []
        for user in users:
            notifications.append(Notification(
                recipient=user.profile,
                sender=existing_user.profile,
                notification_type='new_ebook',
                book=instance,
                message=f'{instance.name} has just been released!'
            ))
        Notification.objects.bulk_create(notifications)


@receiver(pre_save, sender=Book)
def manage_volume_number(sender, instance, **kwargs):
    if instance.series:
        if not instance.volume_number:
            current_max = instance.series.books.aggregate(Max('volume_number'))['volume_number__max']
            instance.volume_number = (current_max + 1) if current_max is not None else 1
        else:
            subsequent_books = instance.series.books.filter(volume_number__gte=instance.volume_number).exclude(pk=instance.pk)
            for book in subsequent_books:
                book.volume_number += 1
                book.save(update_fields=['volume_number'])
    else:
        instance.volume_number = 1


@receiver(post_save, sender=Chapter)
def notify_new_chapter(sender, instance, created, **kwargs):
    if created and instance.published:
        notify_users_of_new_chapter(instance.book)