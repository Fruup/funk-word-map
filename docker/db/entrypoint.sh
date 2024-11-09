#!/bin/sh

if [ -z "$PORT" ]; then
	echo "❌ PORT must be set"
	exit 1
fi

/pb/pocketbase serve --http=0.0.0.0:$PORT
