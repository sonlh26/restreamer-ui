import React from 'react';

import FormInlineButton from './FormInlineButton';

export default function UploadButton(props) {
	const { acceptTypes, label, onError, onStart, onUpload, onProgress, ...other } = props;
	const accept = props.acceptTypes.map((t) => t.mimetype);
	const handleUpload = (event) => {
		const handler = async (event) => {
			const files = event.target.files;

			if (files.length === 0) {
				// no files selected
				props.onError({
					type: 'nofiles',
				});
				return;
			}

			const file = files[0];

			let type = null;
			for (let t of props.acceptTypes) {
				const accept = t.mimetype.split('/');
				const actual = file.type.split('/');

				if (accept[0] !== actual[0]) {
					continue;
				}

				if (accept[1] === '*' || accept[1] === actual[1]) {
					type = t;
					break;
				}
			}

			if (type === null) {
				// not one of the allowed mimetypes
				props.onError({
					type: 'mimetype',
					actual: file.type,
					allowed: accept.slice(),
				});
				return;
			}

			if (file.size > type.maxSize) {
				// the file is too big
				props.onError({
					type: 'size',
					actual: file.size,
					allowed: type.maxSize,
				});
				return;
			}

			props.onStart();
			try {
				const buffer = await readFileInChunks(file, (progress) => {
					props.onProgress(progress);
				});
				props.onUpload(buffer, type.extension, type.mimetype);
			} catch (error) {
				props.onError({
					type: 'read',
					message: error.message,
				});
			}

			// reset the value such that the onChange event will be triggered again
			// if the same file gets selected again
			event.target.value = null;
		};

		handler(event);
	};

	const readFileInChunks = (file, onProgress) => {
		return new Promise((resolve, reject) => {
			const chunkSize = 1024 * 1024 * 10; // 10 MB
			let offset = 0;
			let chunks = [];

			const readNextChunk = () => {
				const slice = file.slice(offset, offset + chunkSize);
				const reader = new FileReader();

				reader.onload = () => {
					chunks.push(reader.result);
					offset += chunkSize;
					const progress = (offset / file.size) * 100;
					onProgress(progress);

					if (offset < file.size) {
						readNextChunk();
					} else {
						resolve(new Blob(chunks));
					}
				};

				reader.onerror = (error) => {
					reject(error);
				};

				reader.readAsArrayBuffer(slice);
			};

			readNextChunk();
		});
	};

	return (
		<div>
			<FormInlineButton component="label" {...other}>
				{props.label}
				<input accept={accept.join(',')} type="file" hidden onChange={handleUpload} />
			</FormInlineButton>
		</div>
	);
}

UploadButton.defaultProps = {
	label: '',
	acceptTypes: [],
	onError: function () {},
	onUpload: function (data, extension) {},
	onProgress: function (progress) {},
};
