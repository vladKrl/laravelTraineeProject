import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api';

let echo = null;
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel, options) => {
            return {
                authorize: (socketId, callback) => {
                    api.post('broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                        .then(response => callback(false, response.data))
                        .catch(error => callback(true, error));
                }
            };
        }
    });

}

export default echo;
