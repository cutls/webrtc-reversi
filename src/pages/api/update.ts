// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getDownloadURL, getStorage } from 'firebase-admin/storage'
import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

type Data = {
    success: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    console.log('update', req.body)
    const body = JSON.parse(req.body)
    const { data, id } = body
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
    console.log(id, data)
    const series = await db.collection('webrtc').doc(id).get()
    if (series.exists) {
        if (!body.answerData) body.answerData = null
        if (!body.data) body.data = null
        await db.collection('webrtc').doc(id).update(body)
    } else {
        const addCase: any = {
            id,
            data: JSON.stringify(data)
        }
        await db.collection('webrtc').doc(id).set(addCase)
    }
    //res.status(200).setHeader('Access-Control-Allow-Origin', 'https://revertc.vercel.app').json({ success: true })
    res.status(200).json({ success: true })
}
