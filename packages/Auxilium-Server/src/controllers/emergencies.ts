import { Request, Response } from 'express';
import * as haversine from 'haversine';
import { Emergency, User } from '../models';
import { sendNotification } from '../helpers';

export const getNearbyEmergencies = async (req: Request, res: Response) => {
	const { longitude, latitude }: { [key: string]: string } = req.query;
	try {
		// const emergencies = await Emergency.find({
		// 	location: {
		// 		$near: {
		// 			$maxDistance: 1000,
		// 			$geometry: {
		// 				type: 'Point',
		// 				coordinates: [Number(longitude), Number(latitude)]
		// 			}
		// 		}
		// 	}
		// }).find();
		const emergencies = await Emergency.find();
		return res.status(200).json({
			success: true,
			emergencies
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'An error has occured. Please try again later.'
		});
	}
};

export const getUserEmergencies = async (req: Request, res: Response) => {
	const { deviceId } = req.query;
	try {
		const user = await User.findOne({ deviceId });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: `No user found with the deviceId: ${deviceId}`
			});
		}
		const emergencies = await Emergency.find({ deviceId });
		return res.status(200).json({
			success: true,
			emergencies
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'An error has occured. Please try again later.'
		});
	}
};

export const backgroundNotifications = async (req: Request, res: Response) => {
	const {
		longitude: lon,
		latitude: lat,
		pushToken
	}: { [key: string]: string } = req.query;
	try {
		const emergencies = await Emergency.find({
			location: {
				$near: {
					$maxDistance: 1000,
					$geometry: {
						type: 'Point',
						coordinates: [Number(lon), Number(lat)]
					}
				}
			}
		}).find();
		emergencies.forEach(async (emergency: any) => {
			const coordinates = emergency.location;
			const [longitude, latitude] = coordinates;
			const distance = haversine(
				{ longitude: Number(lon), latitude: Number(lat) },
				{ longitude, latitude }
			);
			if (distance <= 1 && !emergency.recepients.includes(pushToken)) {
				// TODO: fix case where user has been alerted about emergency previously.
				// Add a recepient array to the the Emergency schema
				// Push the pushToken to the array, if the user has been previously been notified.
				// Check if user's pushToken is in the array
				// If user's pushToken isn't there, send the notification.
				await sendNotification(pushToken);
				await emergency.recepients.push(pushToken);
				emergency.save();
			}
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'An error has occured. Please try again later.'
		});
	}
};
