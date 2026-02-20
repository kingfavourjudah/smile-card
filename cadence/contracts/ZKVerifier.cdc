access(all) contract ZKVerifier {

    access(all) let TIER_PROOF: UInt8
    access(all) let SPENDING_PROOF: UInt8
    access(all) let UNIQUE_USER_PROOF: UInt8

    access(self) let registeredUUIDs: {String: Bool}
    access(self) let usedProofs: {String: Bool}

    access(all) let AdminStoragePath: StoragePath

    access(all) event UUIDRegistered(hashID: String)
    access(all) event ProofVerified(proofType: UInt8, hashID: String)

    access(all) entitlement AdminEntitlement

    access(all) struct Proof {
        access(all) let proofType: UInt8
        access(all) let proofData: [UInt8]
        access(all) let publicInputs: [String]
        access(all) let timestamp: UFix64

        init(
            proofType: UInt8,
            proofData: [UInt8],
            publicInputs: [String]
        ) {
            self.proofType = proofType
            self.proofData = proofData
            self.publicInputs = publicInputs
            self.timestamp = getCurrentBlock().timestamp
        }
    }

    access(all) resource Admin {
        access(AdminEntitlement) fun registerUUIDHash(hashID: String) {
            pre {
                !ZKVerifier.registeredUUIDs.containsKey(hashID): "UUID hash already registered"
            }
            ZKVerifier.registeredUUIDs[hashID] = true
            emit UUIDRegistered(hashID: hashID)
        }

        access(AdminEntitlement) fun batchRegisterUUIDs(hashIDs: [String]) {
            for hashID in hashIDs {
                if !ZKVerifier.registeredUUIDs.containsKey(hashID) {
                    ZKVerifier.registeredUUIDs[hashID] = true
                    emit UUIDRegistered(hashID: hashID)
                }
            }
        }
    }

    access(all) fun verifyProof(proof: Proof, hashID: String): Bool {
        let proofKey = String.encodeHex(HashAlgorithm.SHA3_256.hash(proof.proofData))

        if self.usedProofs.containsKey(proofKey) {
            return false
        }

        var isValid = false

        switch proof.proofType {
            case self.TIER_PROOF:
                isValid = self.verifyTierProof(proof: proof, hashID: hashID)
            case self.SPENDING_PROOF:
                isValid = self.verifySpendingProof(proof: proof, hashID: hashID)
            case self.UNIQUE_USER_PROOF:
                isValid = self.verifyUniqueUserProof(proof: proof, hashID: hashID)
            default:
                return false
        }

        if isValid {
            self.usedProofs[proofKey] = true
            emit ProofVerified(proofType: proof.proofType, hashID: hashID)
        }

        return isValid
    }

    access(self) fun verifyTierProof(proof: Proof, hashID: String): Bool {
        if proof.publicInputs.length < 2 {
            return false
        }
        let commitment = String.encodeHex(
            HashAlgorithm.SHA3_256.hash(hashID.utf8.concat(proof.publicInputs[0].utf8))
        )
        return commitment == proof.publicInputs[1]
    }

    access(self) fun verifySpendingProof(proof: Proof, hashID: String): Bool {
        if proof.publicInputs.length < 1 {
            return false
        }
        return self.registeredUUIDs.containsKey(hashID)
    }

    access(self) fun verifyUniqueUserProof(proof: Proof, hashID: String): Bool {
        return self.registeredUUIDs.containsKey(hashID)
    }

    access(all) fun isRegisteredUser(hashID: String): Bool {
        return self.registeredUUIDs.containsKey(hashID)
    }

    access(all) fun isProofUsed(proofData: [UInt8]): Bool {
        let proofKey = String.encodeHex(HashAlgorithm.SHA3_256.hash(proofData))
        return self.usedProofs.containsKey(proofKey)
    }

    access(all) fun generateCommitment(secret: String, data: String): String {
        return String.encodeHex(
            HashAlgorithm.SHA3_256.hash(secret.utf8.concat(data.utf8))
        )
    }

    init() {
        self.TIER_PROOF = 0
        self.SPENDING_PROOF = 1
        self.UNIQUE_USER_PROOF = 2

        self.registeredUUIDs = {}
        self.usedProofs = {}

        self.AdminStoragePath = /storage/ZKVerifierAdmin

        let admin <- create Admin()
        self.account.storage.save(<- admin, to: self.AdminStoragePath)
    }
}
