import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import '../styles/styles.css';
import '../styles/More.css';

const Terms = ({ restaurantData }) => {
    const navigate = useNavigate();
    const restoName =
        restaurantData?.restoDetails?.restoName?.trim() || 'the restaurant';

    const sections = [
        {
            title: '1. Acceptance of Terms',
            points: [
                `By accessing and using this platform, you confirm that you have read, understood, and accepted ${restoName}'s Terms & Conditions provided below.`,
            ],
        },
        {
            title: '2. Menu & Availability',
            points: [
                `The ${restoName} reserves the right to modify, remove, or discontinue any item from the menu at any time.`,
                'All items listed on this platform are subject to availability and may not be available at the time of ordering.',
            ],
        },
        {
            title: '3. Orders',
            points: [
                `All orders placed through this platform are subject to acceptance by the ${restoName}.`,
                `If an item becomes unavailable after an order is placed, the ${restoName} may contact you or adjust the order accordingly.`,
            ],
        },
        {
            title: '4. Online Payment & Screenshot Verification',
            points: [
                `Customers making online payments, are required to attach an unaltered screenshot of the successful transfer, so the ${restoName} can verify it.`,
                'Tampered or modified screenshots will be considered invalid and may result in order cancellation and legal action.',
                `If the ${restoName} does not receive the amount, or if there is a dispute over payment or suspected modification, you will be notified, or you can contact the ${restoName} by phone and discuss it directly.`,
            ],
        },
        {
            title: '5. Table Reservations',
            points: [
                `A table reservation made through this platform is treated as a request until it is confirmed by the ${restoName}.`,
                'Tables are held for a limited grace period after the reserved time, after which the reservation may be released.',
                `The ${restoName} may reschedule or cancel a reservation due to unforeseen operational circumstances.`,
            ],
        },
        {
            title: '6. Platform Misuse & Reverse Engineering',
            points: [
                'You agree not to misuse this platform in any way, including attempts to reverse engineer, modify, automate, or disrupt its normal operation.',
                'Any tampering with pricing, orders, billing, or security features is not permitted and may attract legal charges.',
                'For security and misuse prevention, system logs such as your IP address, device/browser details, session information, and activity timestamps may also be recorded automatically.',
                'These records may be used to identify, investigate, and take action against tampering, unauthorised access, or misuse of this platform.'
            ],
        },
        {
            title: '7. Intellectual Property & Conduct',
            points: [
                'This platform, including its design, layout, code, branding, and content, is owned by Harshtag.',
                'It is protected under the Copyright Act, 1957 (Sections 13, 14, 51, 63 and 63B) and the Trade Marks Act, 1999 (Sections 28, 29, and 103).',
                'Any unauthorised copying/misuse or tampering may attract legal action under Information Technology Act, 2000 (Sections 43 and 66) as well as provisions mentioned above.',
            ],
        },
        {
            title: '8. Privacy',
            points: [
                'We collect only the details needed to process your order or reservation, such as your name, phone number and table or delivery information.',
                'Your details are used to fulfil and support your order and are not sold to third parties.',
            ],
        },
        {
            title: '9. Limitation of Liability',
            points: [
                'While we try to keep this platform running smoothly, temporary interruptions may occur due to technical or connectivity issues.',
                'Harshtag shall not be liable for any loss arising from such interruptions, failed payments, delayed messages, or issues outside its direct control.',
                `Food, service, and order fulfilment are handled directly by ${restoName}, and any related concern should be discussed with them.`,
            ],
        },
        {
            title: '10. Contact Us',
            points: [
                `For any question, complaint or clarification regarding these terms or your order, please contact ${restoName} directly using the Call or WhatsApp options available on the More screen.`,
            ],
        },
    ];

    return (
        <div className="more-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Terms &amp; Conditions</div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="more-container">
                <div className="terms-content">
                    {sections.map((section) => (
                        <div className="terms-section" key={section.title}>
                            <div className="terms-heading">{section.title}</div>
                            <ul className="terms-list">
                                {section.points.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Terms;
