package com.studyhub.common.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String role;
    private final String department;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String email, String role, String department) {
        this.id = id;
        this.email = email;
        this.role = role != null && role.startsWith("ROLE_") ? role : "ROLE_" + (role != null ? role : "STUDENT");
        this.department = department;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(this.role));
    }

    public String getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
