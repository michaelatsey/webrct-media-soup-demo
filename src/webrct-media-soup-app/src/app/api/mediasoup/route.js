import { Worker, Router, WebRtcTransport, WebRtcServer } from 'mediasoup/node';
import { config } from './config';

let worker;
let router;
let webRtcServer;

export async function POST(req) {
  try {
    const { type, transportId, dtlsParameters, kind, rtpParameters } = await req.json();

    if (!worker) {
      worker = await createWorker();
      router = await createRouter(worker);
      webRtcServer = await createWebRtcServer(worker);
    }

    switch (type) {
      case 'createTransport':
        const transport = await createWebRtcTransport(router, webRtcServer!);
        return Response.json({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });

      case 'connectTransport':
        const connectTransport = await router?.getTransport(transportId);
        await connectTransport.connect({ dtlsParameters });
        return Response.json({ connected: true });

      case 'produce':
        const produceTransport = await router?.getTransport(transportId);
        const producer = await produceTransport.produce({ kind, rtpParameters });
        return Response.json({ id: producer.id });

      default:
        return Response.json({ error: 'Unknown request type' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}