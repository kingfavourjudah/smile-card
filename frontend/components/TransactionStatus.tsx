"use client";

interface TransactionStatusProps {
  status: "idle" | "pending" | "success" | "error";
  txId?: string;
  message?: string;
  onClose: () => void;
}

export default function TransactionStatus({
  status,
  txId,
  message,
  onClose,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#16213e] rounded-2xl p-8 max-w-sm w-full mx-4 border border-gray-700/50 text-center">
        {status === "pending" && (
          <>
            <div className="w-12 h-12 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Processing</h3>
            <p className="text-sm text-gray-400">{message || "Waiting for transaction..."}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Success</h3>
            <p className="text-sm text-gray-400 mb-2">{message || "Transaction confirmed!"}</p>
            {txId && (
              <p className="text-xs text-gray-500 font-mono break-all">TX: {txId}</p>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Error</h3>
            <p className="text-sm text-red-400">{message || "Transaction failed"}</p>
          </>
        )}

        {status !== "pending" && (
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-white"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
