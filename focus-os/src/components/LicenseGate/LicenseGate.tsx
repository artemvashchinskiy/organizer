import { useState } from "react";
import { installLicense, obtainDevelopmentLicense } from "../../services/licenseService";
import "./LicenseGate.scss";

interface Props {
    userId: string;
}

export default function LicenseGate({ userId }: Props) {
    const [showEnter, setShowEnter] = useState(false);
    const [enteredKey, setEnteredKey] = useState("");
    const [error, setError] = useState("");

    function claimLicense() {
        obtainDevelopmentLicense(userId);
        window.location.reload();
    }

    function activateEnteredLicense() {
        try {
            installLicense(userId, enteredKey);
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid Focus OS license key.");
        }
    }

    return (
        <main className="license-gate">
            <section className="license-gate-card">
                <div className="license-gate-mark">◆</div>
                <p className="license-gate-kicker">FOCUS OS</p>
                <h1>License activation required</h1>
                <p className="license-gate-copy">
                    Your complimentary 15-day trial has ended.
                    Activate a complimentary Focus OS license to continue using the service.
                </p>

                <button type="button" className="license-gate-primary" onClick={claimLicense}>
                    Claim Complimentary License
                </button>

                <button
                    type="button"
                    className="license-gate-secondary"
                    onClick={() => {
                        setShowEnter(value => !value);
                        setError("");
                    }}
                >
                    Enter a License
                </button>

                {showEnter && (
                    <div className="license-gate-enter">
                        <label htmlFor="license-gate-key">License key</label>
                        <input
                            id="license-gate-key"
                            value={enteredKey}
                            onChange={event => {
                                setEnteredKey(event.target.value.toUpperCase());
                                setError("");
                            }}
                            placeholder="FOCUS-XXXX-XXXX-XXXX-XXXX"
                            autoFocus
                        />
                        {error && <div className="license-gate-error">{error}</div>}
                        <button type="button" className="license-gate-primary" onClick={activateEnteredLicense}>
                            Activate
                        </button>
                    </div>
                )}

                <p className="license-gate-footnote">No payment is required inside Focus OS.</p>
            </section>
        </main>
    );
}
