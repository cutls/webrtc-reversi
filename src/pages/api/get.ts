// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getDownloadURL, getStorage } from 'firebase-admin/storage'
import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

type Data = {
	data: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const body = req.body
	const { id: seriesId, from } = body
	if (admin.apps.length === 0) {
		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
			})
		})
	}
	const db = getFirestore()
    const series = await db.collection('webrtc').doc(seriesId).get()
    const seriesDoc = series.data()
    const data = seriesDoc?.data
	//res.status(200).setHeader('Access-Control-Allow-Origin', 'https://revertc.vercel.app').json({ data })
    res.status(200).json(seriesDoc)
}
