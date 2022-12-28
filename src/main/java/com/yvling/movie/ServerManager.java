package com.yvling.movie;

import jakarta.servlet.annotation.WebServlet;

import java.io.IOException;
import java.util.*;

@WebServlet(name="ServerManager",urlPatterns = "/ServerManager",loadOnStartup=1)
public class ServerManager {
    private static Collection<Synchronize> servers = Collections.synchronizedCollection(new ArrayList<Synchronize>());
    public static Map<String, String> room_info = new HashMap<>();
    public static Map<String, String> video_info = new HashMap<>();

    public static void broadCast(String msg){
        for (Synchronize synchronize : servers) {
            try {
                synchronize.sendMessage(msg);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static int getTotal(){
        return servers.size();
    }
    public static void add(Synchronize server){
        servers.add(server);
        System.out.println("有新连接加入！ 当前总连接数是："+ servers.size());
    }
    public static void remove(Synchronize server){
        servers.remove(server);
        System.out.println("有连接退出！ 当前总连接数是："+ servers.size());
        if(servers.size() == 0) {
            room_info.clear();
            video_info.clear();
        }
    }
}
