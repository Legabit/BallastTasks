import logging

import redis
from django.conf import settings
from django.db import connection
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def health_check(request):
    status_code = 200
    db_status = "connected"
    cache_status = "connected"

    # Database connectivity check
    try:
        connection.ensure_connection()
    except Exception as e:
        logger.error("Database health check error: %s", e)
        db_status = "unavailable"
        status_code = 503

    # Redis connectivity check
    try:
        redis_url = getattr(settings, "CELERY_BROKER_URL", "redis://redis:6379/0")
        client = redis.from_url(redis_url, socket_connect_timeout=1)
        client.ping()
    except Exception as e:
        logger.warning("Redis health check error: %s", e)
        cache_status = "unavailable"

    overall_status = "ok" if (status_code == 200 and cache_status == "connected") else "degraded"

    return JsonResponse(
        {
            "status": overall_status,
            "database": db_status,
            "cache": cache_status,
        },
        status=status_code,
    )
