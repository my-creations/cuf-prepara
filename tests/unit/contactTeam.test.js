import { setupContactTeamAction } from '../../js/modules/contactTeam.js';

const t = (key) => {
  const map = {
    'contactForm.title': 'Contact the team',
    'contactForm.subtitle': 'Describe the issue.',
    'contactForm.emailLabel': 'Your email',
    'contactForm.emailPlaceholder': 'name@example.com',
    'contactForm.issueLabel': 'Issue',
    'contactForm.issuePlaceholder': 'Describe...',
    'contactForm.note': 'Will open email app',
    'contactForm.cancel': 'Cancel',
    'contactForm.send': 'Send',
    'contactForm.subject': 'Support request',
    'contactForm.bodyEmailLabel': 'Email',
    'contactForm.bodyIssueLabel': 'Question / issue',
  };
  return map[key] ?? key;
};

describe('contactTeam module', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="contactTeamBtn">Contact</button><div id="modalBody"></div>';
  });

  it('opens the contact form modal and builds a mailto URL on submit', () => {
    const button = document.getElementById('contactTeamBtn');
    const modalBody = document.getElementById('modalBody');
    const closeModal = vi.fn();
    const navigate = vi.fn();

    const modalControls = {
      openModal: vi.fn((html) => {
        modalBody.innerHTML = html;
      }),
      closeModal,
    };

    setupContactTeamAction({
      button,
      modalControls,
      modalBody,
      getText: t,
      recipientEmail: 'pmrobalo@gmail.com',
      navigate,
    });

    button.click();

    expect(modalControls.openModal).toHaveBeenCalledTimes(1);
    const form = modalBody.querySelector('#contactTeamForm');
    expect(form).not.toBeNull();

    form.querySelector('input[name="email"]').value = 'user@example.com';
    form.querySelector('textarea[name="issue"]').value = 'I have a preparation question';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(navigate).toHaveBeenCalledTimes(1);
    const [mailtoUrl] = navigate.mock.calls[0];
    expect(mailtoUrl).toContain('mailto:pmrobalo@gmail.com');
    expect(mailtoUrl).toContain(encodeURIComponent('Support request'));
    expect(mailtoUrl).toContain(encodeURIComponent('Email: user@example.com'));
    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
