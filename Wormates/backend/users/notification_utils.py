# users/notification_utils.py
from django.apps import apps
from django.contrib.auth.models import User  # Make sure to import User

from .models import Notification, UserBookChapterNotification, Library


def send_book_update_notifications(book, chapter_title):
    users_to_notify = set()
    categories = ['reading', 'liked', 'wish_list', 'favorites']

    for category in categories:
        # Получаем библиотеки, где книга находится в соответствующей категории
        libraries = Library.objects.filter(**{f'{category}_books': book})

        # Получаем пользователей из библиотек
        for library in libraries:
            user = library.user
            user_settings = user.notification_settings
            notify_attr = f'library_{category}_updates'
            if getattr(user_settings, notify_attr, False):
                users_to_notify.add(user)

    # Создаём уведомления для пользователей
    for user in users_to_notify:
        user_settings = user.notification_settings

        # Получаем или создаём запись UserBookChapterNotification
        ubcn, created = UserBookChapterNotification.objects.get_or_create(user=user, book=book)

        current_chapter_count = book.chapter_count()
        chapters_since_last_notified = current_chapter_count - ubcn.chapter_count_at_last_notification

        if chapters_since_last_notified >= user_settings.chapter_notification_threshold:
            ubcn.last_notified_chapter_count = current_chapter_count
            ubcn.chapter_count_at_last_notification = current_chapter_count
            ubcn.save()

            Notification.objects.create(
                recipient=user.profile,
                sender=book.author.profile,
                notification_type='book_update',
                book=book,
                book_name=book.name,
                chapter_title=chapter_title
            )

