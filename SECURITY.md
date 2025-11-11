# Security Policy

## Supported Versions

Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT open a public issue

Please do not publicly disclose the vulnerability until we've had a chance to address it.

### 2. Report privately

Send an email to the project maintainers with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Wait for response

We will:
- Acknowledge receipt within 48 hours
- Provide an estimated timeline for a fix
- Keep you updated on progress
- Credit you in the security advisory (if desired)

## Security Best Practices

When deploying Cross-Chat:

### Production Deployment

1. **Use HTTPS**: Always use SSL/TLS in production
2. **Strong Secrets**: Use strong, random JWT secrets
3. **Update Dependencies**: Keep all dependencies up to date
4. **Secure MongoDB**: Use authentication and restrict network access
5. **Environment Variables**: Never commit secrets to version control
6. **Firewall**: Configure firewall rules appropriately
7. **Regular Backups**: Implement regular database backups
8. **Rate Limiting**: Implement rate limiting on API endpoints
9. **Input Validation**: Already implemented, but review regularly
10. **Security Headers**: Configure appropriate HTTP security headers

### Nginx Security Headers

Add to your nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### MongoDB Security

```bash
# Enable authentication
# In mongod.conf:
security:
  authorization: enabled

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

### Password Policy

The application requires:
- Minimum 6 characters (consider increasing to 8-12)
- Passwords are hashed with bcrypt

Consider implementing:
- Password complexity requirements
- Password history
- Account lockout after failed attempts

## Known Security Considerations

1. **WebSocket Authentication**: WebSocket connections are authenticated via JWT
2. **Password Storage**: Passwords are hashed using bcrypt with salt rounds
3. **Input Validation**: Using express-validator for API input validation
4. **CORS**: Configurable via environment variables
5. **XSS Protection**: React escapes output by default

## Vulnerability Disclosure

We follow responsible disclosure practices:

1. Vulnerabilities are patched quickly
2. Security advisories are published after fixes
3. Users are notified of critical updates
4. CVE numbers assigned when applicable

## Updates and Patches

- Security patches are released as soon as possible
- Minor security updates: within 7 days
- Critical security updates: within 24-48 hours
- Subscribe to releases to stay informed

## Contact

For security concerns, please contact the maintainers through GitHub.

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities.
