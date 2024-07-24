import { DetailedPeerCertificate, PeerCertificate, TLSSocket } from 'node:tls';

type CertificateEntity = {
  country?: string;
  street?: string;
  locality?: string;
  organization?: string;
  organizationalUnit?: string;
  commonName?: string;
};

type CertificateInfo = {
  subject: CertificateEntity;
  issuer: CertificateEntity;
  validFrom: string;
  validTo: string;
  subjectAltName?: string;
  isCa: boolean;
  fingerprint: string;
  isSelfSigned: boolean;
};

type CipherInfo = {
  name: string;
  version: string;
};

type RequestSslInfo = {
  authorized: boolean;
  authorizationError?: string;
  encrypted: boolean;
  certificateValid: boolean;
  certificateErrors: string[];
  cipher: CipherInfo;
  certs: CertificateInfo[];
};

function validateCertificate(cert: DetailedPeerCertificate, hostname: string) {
  const now = new Date();
  const validFrom = new Date(cert.valid_from);
  const validTo = new Date(cert.valid_to);

  const errors: string[] = [];

  // Check if the certificate has expired
  if (now.valueOf() > validTo.valueOf()) {
    errors.push('Certificate is expired');
  }
  if (now.valueOf() < validFrom.valueOf()) {
    errors.push('Certificate is not yet valid');
  }

  // Check if the certificate is self-signed
  if (JSON.stringify(cert.subject) === JSON.stringify(cert.issuer)) {
    errors.push('Certificate is self-signed');
  }

  // Check if the hostname matches the certificate's Common Name or Subject Alternative Names
  const hostnameMatch = checkHostname(cert, hostname);
  if (!hostnameMatch) {
    errors.push('Hostname does not match certificate');
  }

  // Check certificate chain (simplified)
  if (!cert.issuerCertificate) {
    errors.push('Incomplete certificate chain');
  }

  // Check for weak key (example: RSA key less than 2048 bits)
  if (cert.pubkey && cert.pubkey.length < 256) {
    // 2048 bits = 256 bytes
    errors.push('Weak public key');
  }

  return errors;
}

function checkHostname(cert: DetailedPeerCertificate, hostname: string) {
  // Check Common Name. This could be an regex, but browser normally don't support regex here
  if (cert.subject.CN === hostname) {
    return true;
  }

  // Check Subject Alternative Names
  const altNames = cert.subjectaltname;
  if (altNames) {
    const names = altNames.split(', ');
    for (let name of names) {
      if (name.startsWith('DNS:')) {
        const dnsName = name.slice(4);
        const dnsPattern = dnsName.replace(/\./g, '\\.').replace(/\*/g, '[^.]+');
        const dnsRegex = new RegExp(`^${dnsPattern}$`, 'i');
        if (dnsRegex.test(hostname)) {
          return true;
        }
      }
    }
  }

  return false;
}

function collectCertificateData(certChain: PeerCertificate): CertificateInfo {
  const isSelfSigned = JSON.stringify(certChain.subject) === JSON.stringify(certChain.issuer);
  return {
    subject: {
      country: certChain.subject.C,
      street: certChain.subject.ST,
      locality: certChain.subject.L,
      organization: certChain.subject.O,
      organizationalUnit: certChain.subject.OU,
      commonName: certChain.subject.CN
    },
    issuer: {
      country: certChain.issuer.C,
      street: certChain.issuer.ST,
      locality: certChain.issuer.L,
      organization: certChain.issuer.O,
      organizationalUnit: certChain.issuer.OU,
      commonName: certChain.issuer.CN
    },
    validFrom: certChain.valid_from,
    validTo: certChain.valid_to,
    subjectAltName: certChain.subjectaltname,
    isCa: certChain.ca,
    fingerprint: certChain.fingerprint,
    isSelfSigned
  };
}

function getCertificatesRecursive(
  certChain: DetailedPeerCertificate,
  processedCerts: Set<string> = new Set()
): CertificateInfo[] {
  const certs: CertificateInfo[] = [];
  let currentCert: DetailedPeerCertificate | null = certChain;

  while (currentCert) {
    const fingerprint = currentCert.fingerprint;
    if (processedCerts.has(fingerprint)) {
      break;
    }

    processedCerts.add(fingerprint);
    certs.push(collectCertificateData(currentCert));
    currentCert = currentCert.issuerCertificate;

    if (currentCert && currentCert.fingerprint === fingerprint) {
      break;
    }
  }

  return certs;
}

export function collectSslInfo(socket: TLSSocket, hostname: string): RequestSslInfo {
  const certChain = socket.getPeerCertificate(true);

  const certificateErrors = validateCertificate(certChain, hostname);

  return {
    authorized: socket.authorized,
    authorizationError: socket.authorizationError?.message,
    encrypted: socket.encrypted,
    certificateValid: certificateErrors.length === 0,
    certificateErrors,
    cipher: socket.getCipher(),
    certs: getCertificatesRecursive(certChain)
  };
}
