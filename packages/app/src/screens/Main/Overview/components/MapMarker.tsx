import React from 'react';
import { View } from 'react-native';

interface NewMarkerProps {
	size: number;
	borderStroke?: number;
}

const MapMarker = ({ size, borderStroke }: NewMarkerProps) => (
	<View
		style={{
			height: size,
			width: size,
			borderRadius: size / 2,
			backgroundColor: '#FF4D4D',
			borderWidth: 1 || borderStroke,
			borderColor: '#000000'
		}}
	/>
);

export default MapMarker;
