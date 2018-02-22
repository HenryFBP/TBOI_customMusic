@ECHO OFF

SET debug=false

SET runtime=python
SET messenger=messenger.py

IF "%debug%"=="true" (
    @ECHO ON
    
    ECHO Hi. We were passed: %*
    ECHO Current .BAT dir: %~dp0

    CMD /K %runtime% "%~dp0%messenger%" %*
) ELSE (
    START /MIN "" %runtime% "%~dp0%messenger%" %*
)


IF "%debug%"=="true" (
    PAUSE
)



EXIT
