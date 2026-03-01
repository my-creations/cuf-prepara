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

  it('reports validity and does not navigate when form is incomplete', () => {
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
    const form = modalBody.querySelector('#contactTeamForm');
    const reportValidity = vi.fn();
    form.reportValidity = reportValidity;

    form.querySelector('input[name="email"]').value = '';
    form.querySelector('textarea[name="issue"]').value = '';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(reportValidity).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('escapes translated HTML content and ignores missing button', () => {
    const modalBody = document.getElementById('modalBody');
    const modalControls = {
      openModal: vi.fn((html) => {
        modalBody.innerHTML = html;
      }),
      closeModal: vi.fn(),
    };

    expect(() =>
      setupContactTeamAction({
        button: null,
        modalControls,
        modalBody,
        getText: t,
        recipientEmail: 'pmrobalo@gmail.com',
      })
    ).not.toThrow();

    const button = document.getElementById('contactTeamBtn');
    setupContactTeamAction({
      button,
      modalControls,
      modalBody,
      getText: (key) => (key === 'contactForm.title' ? '<b>Unsafe</b>' : t(key)),
      recipientEmail: 'pmrobalo@gmail.com',
    });

    button.click();
    expect(modalBody.innerHTML).toContain('&lt;b&gt;Unsafe&lt;/b&gt;');
  });

  it('safely returns when modal controls are missing or form is not rendered', () => {
    const button = document.getElementById('contactTeamBtn');
    const modalBody = document.getElementById('modalBody');

    setupContactTeamAction({
      button,
      modalControls: null,
      modalBody,
      getText: t,
      recipientEmail: 'pmrobalo@gmail.com',
    });

    expect(() => button.click()).not.toThrow();

    const modalControls = {
      openModal: vi.fn(() => {
        modalBody.innerHTML = '<p>No form</p>';
      }),
      closeModal: vi.fn(),
    };

    setupContactTeamAction({
      button,
      modalControls,
      modalBody,
      getText: () => undefined,
      recipientEmail: 'pmrobalo@gmail.com',
    });

    expect(() => button.click()).not.toThrow();
    expect(modalControls.openModal).toHaveBeenCalled();
  });
});
