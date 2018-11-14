#!/bin/bash
# Set UTF-8 encoding
export LANG=UTF-8
# Needed to work in SourceTree
export PATH=/usr/local/bin:$PATH

set -e -o pipefail
DIR_PATH="$(dirname $1)"
FILENAME="$(basename $1)"
EXPORT_FOLDER="$2"
# BUNDLE_PATH="$4"
# FORMAT="$5"
# SCALE="$6"
# INCLUDE_OVERVIEW="$7"


sketch=${DIR_PATH}/${FILENAME}
unzipped_directory=${EXPORT_FOLDER}
if ! [ -e "${unzipped_directory}" ] ;then
  mkdir -p "${unzipped_directory}"
fi

cd "$DIR_PATH"

# Unzip Sketch file
if unzip -q -o $sketch -d ${EXPORT_FOLDER}; then
	if cd "$unzipped_directory"; then

		echo "  '$(basename $sketch)' unzipped."
		# Prettify all JSON files
		for json_file in $(find . -name "*.json"); do
			if python -m json.tool "$json_file" "$json_file".pretty; then
				if mv "$json_file".pretty "$json_file"; then
					echo "  '$json_file' prettified."
				else
					echo "  Couldn't move prettified '$json_file'."
					rm -rf "$unzipped_directory"
					exit 1
				fi
			else
				echo "  Couldn't prettify '$json_file'."
				rm -rf "$unzipped_directory"
				exit 1
			fi
		done
	else
		echo "  Couldn't change directory to '$unzipped_directory'."
		exit 1
	fi
else
	echo "  Couldn't unzip '$(basename $sketch)'."
	rm -rf "$unzipped_directory"
	exit 1
fi


cd "$DIR_PATH"

preview_folder="$EXPORT_FOLDER/previews"
rm "$preview_folder/preview.png"
# get list of artboard names to export
#ARTBOARDS=$("$BUNDLE_PATH"/Contents/Resources/sketchtool/bin/sketchtool list artboards "$FILENAME" --include-symbols=NO | python "$(dirname "$0")"/getArtboardNames.py "$IGNORE" | tr '\n' ',')

# generate new artboards
#mkdir -p "$preview_folder"
#"$BUNDLE_PATH"/Contents/Resources/sketchtool/bin/sketchtool export artboards "$FILENAME" --formats="$FORMAT" --scales="$SCALE" --output="$preview_folder" --overwriting=YES --items="$ARTBOARDS" --include-symbols=YES
