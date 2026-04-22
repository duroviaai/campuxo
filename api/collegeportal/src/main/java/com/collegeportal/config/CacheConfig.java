package com.collegeportal.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // dynamic=true: auto-creates any cache name on first use, no need to pre-declare
        return new ConcurrentMapCacheManager();
    }
}
