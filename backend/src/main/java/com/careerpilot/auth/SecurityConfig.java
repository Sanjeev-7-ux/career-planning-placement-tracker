package com.careerpilot.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/health", "/h2-console/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/companies/**", "/api/opportunities/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications/student/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/applications/*").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/applications/company/**").hasAnyRole("COMPANY", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/applications/*/status").hasAnyRole("COMPANY", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/companies/**", "/api/opportunities/**").hasAnyRole("COMPANY", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**", "/api/opportunities/**").hasAnyRole("COMPANY", "ADMIN")
                        .requestMatchers("/api/students/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/interviews/student/**", "/api/offers/student/**").hasAnyRole("STUDENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/interviews", "/api/offers").hasAnyRole("COMPANY", "ADMIN")
                        .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
