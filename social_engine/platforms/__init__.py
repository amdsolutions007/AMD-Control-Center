"""Platform integrations for social media automation"""

from .twitter import TwitterPlatform
from .telegram import TelegramPlatform
from .youtube import YouTubePlatform
from .snapchat import SnapchatPlatform

__all__ = ['TwitterPlatform', 'TelegramPlatform', 'YouTubePlatform', 'SnapchatPlatform']
