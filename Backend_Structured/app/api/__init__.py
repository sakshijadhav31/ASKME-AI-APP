from .v1 import api_router as api_v1_router

# हे 'Export' केल्यामुळे तुम्ही app/main.py मध्ये थेट असे लिहू शकता:
# from app.api import api_v1_router

__all__ = ["api_v1_router"]