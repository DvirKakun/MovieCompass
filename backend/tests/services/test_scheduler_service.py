# tests/services/test_scheduler_service.py
import logging
from datetime import datetime
from unittest.mock import patch, MagicMock
import pytest

# <-- this is the correct path in YOUR project
from app.services.scheduler import delete_unverified_users


# Capture INFO logs automatically for every test
@pytest.fixture(autouse=True)
def _info_logs(caplog):
    caplog.set_level(logging.INFO)


def test_delete_unverified_users_filter_and_log(caplog):
    """
    • users_collection.delete_many called with expected filter
    • log message contains deleted_count
    """
    with patch("app.services.scheduler.users_collection") as mock_coll:
        mock_result = MagicMock(deleted_count=5)
        mock_coll.delete_many.return_value = mock_result

        delete_unverified_users()

        # ---- Mongo filter assertions ----
        mock_coll.delete_many.assert_called_once()
        flt = mock_coll.delete_many.call_args.args[0]

        assert flt["is_verified"] is False
        assert "$lt" in flt["created_at"]
        assert isinstance(flt["created_at"]["$lt"], datetime)

        # ---- logging assertion ----
        assert "Deleted 5 unverified user(s)" in caplog.text
