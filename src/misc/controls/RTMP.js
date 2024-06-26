import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Trans } from '@lingui/macro';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import BoxText from '../BoxText';
import Checkbox from '../Checkbox';

function init(settings) {
	const initSettings = {
		enable: false,
		...settings,
	};

	return initSettings;
}

export default function Control(props) {
	const navigate = useNavigate();
	const settings = init(props.settings);

	// Set the defaults
	React.useEffect(() => {
		props.onChange(settings, true);

	}, []);

	const handleChange = (what) => (event) => {
		const value = event.target.value;

		if (['enable'].includes(what)) {
			settings[what] = !settings[what];
		} else {
			settings[what] = value;
		}

		props.onChange(settings, false);
	};

	return (
		<Grid container spacing={2}>
			{props.enabled && (
				<Grid item xs={12}>
					<Checkbox
						label={<Trans>Enable</Trans>}
						checked={settings.enable}
						disabled={!props.enabled && settings.enable !== true}
						onChange={handleChange('enable')}
					/>
					<Typography variant="caption">
						<Trans>Make the channel available as an RTMP stream (experimental).</Trans>
					</Typography>
				</Grid>
			)}
			{!props.enabled && (
				<Grid item xs={12}>
					<BoxText textAlign="center">
						<Trans>The RTMP output requires the RTMP Server.</Trans>
						<Button
							variant="outlined"
							size="small"
							style={{ marginTop: 10, marginBottom: 3 }}
							fullWidth
							color="primary"
							onClick={() => navigate('/settings/rtmp')}
						>
							<Trans>Enable now</Trans>
						</Button>
					</BoxText>
				</Grid>
			)}
		</Grid>
	);
}

Control.defaulProps = {
	settings: {},
	enabled: false,
	onChange: function (settings, automatic) {},
};
