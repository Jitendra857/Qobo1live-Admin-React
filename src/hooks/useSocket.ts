import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000'; // Updated to localhost

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to Operational Hub');
            setIsConnected(true);
            socket.emit('join_admin_room');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Operational Hub');
            setIsConnected(false);
        });

        // Global Alert Listeners
        socket.on('admin_alert', (data) => {
            console.log('Administrative Alert:', data);
            
            let message = '';
            switch (data.type) {
                case 'WITHDRAWAL':
                    message = `💰 New Payout Request: ₹${data.data.amount}`;
                    break;
                case 'REPORT':
                    message = `⚠️ New User/Room Report Received`;
                    break;
                case 'SECURITY':
                    message = `🚨 SECURITY SOS: Urgent attention needed!`;
                    break;
                default:
                    message = `System Update: ${data.type}`;
            }

            toast(message, {
                icon: data.type === 'SECURITY' ? '🚨' : '🔔',
                duration: 6000,
                style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected
    };
};
