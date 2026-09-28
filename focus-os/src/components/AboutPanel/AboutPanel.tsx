import "./AboutPanel.scss";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function AboutPanel({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <section className="about-panel open" role="dialog" aria-modal="true">
            <div className="about-header">
                <div>
                    <h3>About Focus OS</h3>
                    <span>Local-first personal organization</span>
                </div>
                <button onClick={onClose} aria-label="Close About">✕</button>
            </div>

            <div className="about-content">
                <section className="about-block">
                    <h4>What is Focus OS?</h4>
                    <p>
                        Focus OS is a lightweight personal organizer built around
                        notes, timers, tasks, expenses and simple daily focus.
                        It is designed to stay useful without turning your
                        personal organization into a complicated service.
                    </p>
                </section>

                <section className="about-block">
                    <h4>Who made it?</h4>
                    <p>
                        Focus OS was created by Artem Vashchinskiy as an
                        independent personal software project.
                    </p>
                </section>

                <section className="about-block">
                    <h4>Why does it exist?</h4>
                    <p>
                        The idea is simple: your organizer should help you
                        organize your own life, not become another system you
                        have to constantly manage.
                    </p>
                </section>

                <section className="about-block">
                    <h4>What happens to your data?</h4>
                    <p>
                        Your everyday data is stored locally in the browser on
                        your device. Cloud backup is optional and only happens
                        through the providers you choose to connect.
                    </p>
                </section>

                <section className="about-block">
                    <h4>How does local-first storage work?</h4>
                    <p>
                        Focus OS keeps working with local browser storage first.
                        Notes, tasks, expenses and other personal information do
                        not need to travel to a remote server just to be usable.
                        When you choose a backup provider, data is transferred
                        only as part of that backup or restore action.
                    </p>
                </section>

                <div className="about-joke">
                    Built with care, persistence, and approximately 3 months of
                    "just one more fix."
                </div>
            </div>
        </section>
    );
}
