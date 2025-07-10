package com.example.user_service.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.user_service.model.Compte;
import com.example.user_service.repository.CompteRepo;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CompteRepo compteRepo;

    public CustomUserDetailsService(CompteRepo compteRepo) {
        this.compteRepo = compteRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
        Compte compte = compteRepo.findByMail(mail)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        return new org.springframework.security.core.userdetails.User(
            compte.getMail(),
            compte.getMotdepasse(),
            List.of(new SimpleGrantedAuthority("ROLE_" + compte.getRole()))
        );
    }
}
