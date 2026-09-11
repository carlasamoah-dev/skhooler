import { create } from "zustand";
import { io } from "socket.io-client";
import { useGroupStore } from "./useGroupStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SOCKET_URL = API_URL.replace("/api", "");

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const currentSocket = get().socket;
    if (currentSocket?.connected) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      set({ isConnected: true });
      const slug = useGroupStore.getState().slug;
      if (slug) {
        // Wait, backend expects `groupId` not `slug` in the join:group!
        // The group object is in useGroupStore.getState().group
        const groupId = useGroupStore.getState().group?.id;
        if (groupId) {
          socket.emit("join:group", groupId);
        }
      }
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinGroup: (groupId) => {
    const { socket, isConnected } = get();
    if (isConnected && socket && groupId) {
      socket.emit("join:group", groupId);
    }
  },

  leaveGroup: (groupId) => {
    const { socket, isConnected } = get();
    if (isConnected && socket && groupId) {
      socket.emit("leave:group", groupId);
    }
  },

  emitTyping: (groupId, postId, parentCommentId, name, isTyping) => {
    const { socket, isConnected } = get();
    if (isConnected && socket && groupId) {
      socket.emit("typing", { groupId, postId, parentCommentId, name, isTyping });
    }
  }
}));
