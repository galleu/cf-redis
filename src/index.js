import { connect } from 'cloudflare:sockets';

export default {
	async fetch(req) {
		const redisAddr = { hostname: "128.0.0.1", port: 6379 };
		const redisPass = "password";
		const url = new URL(req.url);

		try {
			const socket = await connect(redisAddr);

			const writer = socket.writable.getWriter();
			const reader = socket.readable.getReader();

			const auth = `AUTH ${redisPass}\r\n`;
			await writer.write(new TextEncoder().encode(auth));
			const authRead = await reader.read();
			const authResponse = new TextDecoder().decode(authRead.value);

      const command = `GET ${url.pathname}\r\n`;
			await writer.write(new TextEncoder().encode(command));


      let response = "";
			const read = await reader.read();
			response += new TextDecoder().decode(read.value);
			await writer.close();



      return new Response(authResponse + " " + response);
		} catch (error) {
			return new Response("Socket connection failed: " + error, { status: 500 });
		}
	}
};
