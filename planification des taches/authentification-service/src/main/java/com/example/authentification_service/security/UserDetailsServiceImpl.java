package com.example.authentification_service.security;

import com.example.authentification_service.dto.UserDTO;
import com.example.authentification_service.service.UserClient;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserClient userClient;

    public UserDetailsServiceImpl(UserClient userClient) {
        this.userClient = userClient;
    }

    @Override
    public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
        UserDTO user = userClient.getUserByEmail(mail);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }
        return new org.springframework.security.core.userdetails.User(
                user.getMail(),
                user.getMotdepasse(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}

