@ECHO ON

ECHO Hi. We were passed: %*
ECHO Current .BAT dir: %~dp0

START /MIN "" py "%~dp0messenger.py" %*

EXIT
