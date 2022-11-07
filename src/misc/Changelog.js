import React from 'react';

import { Trans } from '@lingui/macro';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ReactMarkdown from 'react-markdown';
import SemverGt from 'semver/functions/gt';
import SemverLte from 'semver/functions/lte';
import SemverValid from 'semver/functions/valid';

import BoxText from './BoxText';
import Dialog from './modals/Dialog';

const useStyles = makeStyles((theme) => ({
	h1: theme.typography.h1,
	h2: theme.typography.h2,
	h3: theme.typography.h3,
	h4: theme.typography.h4,
	a: {
		color: theme.palette.secondary.main,
	},
}));

export default function Changelog(props) {
	const [$data, setData] = React.useState('');
	const classes = useStyles();

	React.useEffect(() => {
		(async () => {
			await onMount();
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onMount = async () => {
		let data = await loadData();
		data = filter(data, props.current, props.previous);

		setData(data);
	};

	const loadData = async () => {
		let response = null;

		try {
			response = await fetch('CHANGELOG.md', {
				method: 'GET',
			});
		} catch (err) {
			return '';
		}

		if (response.ok === false) {
			return '';
		}

		return await response.text();
	};

	const filter = (data, current, previous) => {
		let lines = data.split('\n');
		let filteredLines = [];

		let copy = true;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('### ')) {
				let version = lines[i].replace('### ', '');

				if (SemverValid(version) === null) {
					if (copy === true) {
						filteredLines.push(lines[i]);
					}

					continue;
				}

				if (current.length === 0) {
					current = version;
				}

				if (previous.length === 0) {
					previous = version;
				}

				if (SemverLte(version, current) && SemverGt(version, previous)) {
					copy = true;
				} else {
					copy = false;
				}
			}

			if (copy === true) {
				filteredLines.push(lines[i]);
			}
		}

		return filteredLines.join('\n');
	};

	if ($data.length === 0 || $data.startsWith('<!DOCTYPE')) {
		return null;
	}

	const renderers = {
		h1: (props) => <h1 className={classes.h1} {...props}>{props.children}</h1>,
		h2: (props) => <h2 className={classes.h2} {...props}>{props.children}</h2>,
		h3: (props) => <h3 className={classes.h3} {...props}>{props.children}</h3>,
		h4: (props) => <h4 className={classes.h4} {...props}>{props.children}</h4>,
		a: (props) => <a className={classes.a} target="_blank" {...props}>{props.children}</a>,
	}

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			title={<Trans>Changelog</Trans>}
			maxWidth={600}
			buttonsRight={
				<Button variant="outlined" color="primary" onClick={props.onClose}>
					<Trans>Dismiss</Trans>
				</Button>
			}
		>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<BoxText alignItems="left">
						<ReactMarkdown
							components={renderers}
						>{$data}</ReactMarkdown>
					</BoxText>
				</Grid>
			</Grid>
		</Dialog>
	);
}

Changelog.defaultProps = {
	open: false,
	current: '',
	previous: '',
	onClose: () => {},
};