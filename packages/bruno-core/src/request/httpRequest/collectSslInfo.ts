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

export type RequestSslInfo = {
  authorized: boolean;
  authorizationError?: string;
  encrypted: boolean;
  cipher: CipherInfo;
  certs: CertificateInfo[];
};

const tlsAuthErrorMapping: Record<string, string> = {
  UNABLE_TO_GET_ISSUER_CERT:
    "Unable to get issuer certificate. The server's certificate issuer is unknown or not trusted. (Error Code: UNABLE_TO_GET_ISSUER_CERT)",
  UNABLE_TO_GET_CRL:
    "Unable to get Certificate Revocation List (CRL). The CRL for the server's certificate could not be obtained. (Error Code: UNABLE_TO_GET_CRL)",
  UNABLE_TO_DECRYPT_CERT_SIGNATURE:
    "Unable to decrypt certificate's signature. There might be an issue with the certificate's encryption. (Error Code: UNABLE_TO_DECRYPT_CERT_SIGNATURE)",
  UNABLE_TO_DECRYPT_CRL_SIGNATURE:
    "Unable to decrypt CRL's signature. There might be an issue with the CRL's encryption. (Error Code: UNABLE_TO_DECRYPT_CRL_SIGNATURE)",
  UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY:
    'Unable to decode issuer public key. The public key of the certificate issuer could not be read or is invalid. (Error Code: UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY)',
  CERT_SIGNATURE_FAILURE:
    "Certificate signature failure. The signature on the server's certificate is invalid. (Error Code: CERT_SIGNATURE_FAILURE)",
  CRL_SIGNATURE_FAILURE:
    'CRL signature failure. The signature on the Certificate Revocation List is invalid. (Error Code: CRL_SIGNATURE_FAILURE)',
  CERT_NOT_YET_VALID:
    "Certificate is not yet valid. The server's certificate has a future start date. (Error Code: CERT_NOT_YET_VALID)",
  CERT_HAS_EXPIRED:
    "Certificate has expired. The server's certificate is no longer valid as its expiration date has passed. (Error Code: CERT_HAS_EXPIRED)",
  CRL_NOT_YET_VALID:
    'CRL is not yet valid. The Certificate Revocation List has a future start date. (Error Code: CRL_NOT_YET_VALID)',
  CRL_HAS_EXPIRED:
    'CRL has expired. The Certificate Revocation List is no longer valid as its expiration date has passed. (Error Code: CRL_HAS_EXPIRED)',
  ERROR_IN_CERT_NOT_BEFORE_FIELD:
    "Error in certificate's notBefore field. The certificate's start date is invalid or improperly formatted. (Error Code: ERROR_IN_CERT_NOT_BEFORE_FIELD)",
  ERROR_IN_CERT_NOT_AFTER_FIELD:
    "Error in certificate's notAfter field. The certificate's expiration date is invalid or improperly formatted. (Error Code: ERROR_IN_CERT_NOT_AFTER_FIELD)",
  ERROR_IN_CRL_LAST_UPDATE_FIELD:
    "Error in CRL's lastUpdate field. The CRL's last update date is invalid or improperly formatted. (Error Code: ERROR_IN_CRL_LAST_UPDATE_FIELD)",
  ERROR_IN_CRL_NEXT_UPDATE_FIELD:
    "Error in CRL's nextUpdate field. The CRL's next update date is invalid or improperly formatted. (Error Code: ERROR_IN_CRL_NEXT_UPDATE_FIELD)",
  OUT_OF_MEM: 'Out of memory. The system ran out of memory while processing the certificate. (Error Code: OUT_OF_MEM)',
  DEPTH_ZERO_SELF_SIGNED_CERT:
    "Depth zero self-signed certificate. The server's certificate is self-signed and is not trusted. (Error Code: DEPTH_ZERO_SELF_SIGNED_CERT)",
  SELF_SIGNED_CERT_IN_CHAIN:
    'Self-signed certificate in certificate chain. One of the certificates in the chain is self-signed and is not trusted. (Error Code: SELF_SIGNED_CERT_IN_CHAIN)',
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY:
    'Unable to get local issuer certificate. The issuer certificate could not be found locally. (Error Code: UNABLE_TO_GET_ISSUER_CERT_LOCALLY)',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE:
    'Unable to verify the first certificate. The first certificate in the chain could not be verified. (Error Code: UNABLE_TO_VERIFY_LEAF_SIGNATURE)',
  CERT_CHAIN_TOO_LONG:
    'Certificate chain too long. The certificate chain exceeded the maximum allowed depth. (Error Code: CERT_CHAIN_TOO_LONG)',
  CERT_REVOKED:
    "Certificate revoked. The server's certificate has been revoked by its issuer. (Error Code: CERT_REVOKED)",
  INVALID_CA: 'Invalid CA certificate. One of the CA certificates is invalid. (Error Code: INVALID_CA)',
  PATH_LENGTH_EXCEEDED:
    'Path length constraint exceeded. The certificate chain is longer than allowed by the CA. (Error Code: PATH_LENGTH_EXCEEDED)',
  INVALID_PURPOSE:
    'Invalid purpose. The certificate cannot be used for the specified purpose. (Error Code: INVALID_PURPOSE)',
  CERT_UNTRUSTED: 'Certificate not trusted. The root CA is not marked as trusted. (Error Code: CERT_UNTRUSTED)',
  CERT_REJECTED:
    'Certificate rejected. The root CA is marked to reject the specified purpose. (Error Code: CERT_REJECTED)',
  HOSTNAME_MISMATCH:
    "Hostname mismatch. The server's hostname does not match the certificate's Subject Alternative Name or Common Name. (Error Code: HOSTNAME_MISMATCH)",
  ERR_TLS_CERT_ALTNAME_INVALID:
    "Server's certificate doesn't match the hostname. Check the server's certificate configuration. (Error Code: ERR_TLS_CERT_ALTNAME_INVALID)"
};

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

  let authorizationError;
  if (socket.authorizationError) {
    const errorCode = String(socket.authorizationError);
    authorizationError = tlsAuthErrorMapping[errorCode] ?? errorCode;
  }

  return {
    authorized: socket.authorized,
    authorizationError,
    encrypted: socket.encrypted,
    cipher: socket.getCipher(),
    certs: getCertificatesRecursive(certChain)
  };
}
