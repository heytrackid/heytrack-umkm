#!/bin/bash

# Script to remove underscore prefix from error variables

echo "Fixing underscore prefixed error variables..."

# Find all TypeScript files and replace _error with err
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/} catch (_error: unknown)/} catch (err: unknown)/g' \
  -e 's/} catch (_error)/} catch (err)/g' \
  -e 's/} catch (_err: unknown)/} catch (err: unknown)/g' \
  -e 's/} catch (_err)/} catch (err)/g' \
  -e 's/{ _error }/{ err }/g' \
  -e 's/{ _error:/{ err:/g' \
  -e 's/error: _error/error: err/g' \
  -e 's/_error instanceof/_err instanceof/g' \
  -e 's/_error\.message/err.message/g' \
  -e 's/String(_error)/String(err)/g' \
  -e 's/getErrorMessage(_error)/getErrorMessage(err)/g' \
  -e 's/throw _error/throw err/g' \
  {} \;

echo "Done! All underscore prefixed error variables have been replaced."
