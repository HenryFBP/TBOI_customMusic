@ECHO ON

ECHO Hi. We were passed: %*
ECHO Current .BAT dir: %~dp0

START /MIN "" python "%~dp0messenger.py" %*

PAUSE

EXIT
