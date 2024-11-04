from django.contrib import admin
from .models import Profile, FollowersCount, Library, Achievement, WebPageSettings, Wallet, PurchasedBook, Notification, UsersNotificationSettings, PersonalReaderSettings

admin.site.register(Profile)
admin.site.register(FollowersCount)
admin.site.register(Library)
admin.site.register(Achievement)
admin.site.register(WebPageSettings)
admin.site.register(Wallet)
admin.site.register(PurchasedBook)
admin.site.register(Notification)
admin.site.register(UsersNotificationSettings)

@admin.register(PersonalReaderSettings)
class PersonalReaderSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'font_size', 'line_height', 'font')
    search_fields = ('user__username', 'theme', 'font')