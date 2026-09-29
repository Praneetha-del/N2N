package com.studyhub.auth.security;

import com.studyhub.auth.entity.User;
import com.studyhub.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        final String searchId = identifier.trim();
        User user = userRepository.findByEmail(searchId)
                .or(() -> userRepository.findByRollNumber(searchId))
                .or(() -> userRepository.findByEmployeeId(searchId))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + searchId));

        String role = user.getRole();
        if (role != null && !role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Boolean.TRUE.equals(user.getIsActive()),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority(role != null ? role : "ROLE_STUDENT"))
        );
    }
}
