// The diagrams remain readable without JavaScript; selection adds a closer explanation.
(() => {
  const labSteps = [
    {
      title: 'Start with a name',
      text: 'A device on the home network asks for a service by name. Select another step to follow where that request goes.'
    },
    {
      title: 'Find the destination',
      text: 'DNS helps the device find the address for that name. If the name does not resolve, this is the first place to look.'
    },
    {
      title: 'Route the request',
      text: 'The reverse proxy receives the request and sends it to the right service. It gives several services a clearer front door.'
    },
    {
      title: 'Reach a service on the Pi',
      text: 'A Docker service running on the Raspberry Pi handles the request. The DNS and proxy services can run on the Pi too; this map follows the request, not separate machines.'
    }
  ];

  const labButtons = [...document.querySelectorAll('[data-lab-step]')];
  const labDetail = document.querySelector('.lab-step-detail');
  if (labButtons.length === labSteps.length && labDetail) {
    const arrows = [...document.querySelectorAll('.lab-map-arrow')];
    labButtons.forEach((button, index) => button.addEventListener('click', () => {
      labButtons.forEach((item, itemIndex) => {
        const active = itemIndex === index;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      arrows.forEach((arrow, arrowIndex) => arrow.classList.toggle('is-lit', arrowIndex < index));
      labDetail.querySelector('.lab-detail-count').textContent = `${String(index + 1).padStart(2, '0')} / 04`;
      labDetail.querySelector('h3').textContent = labSteps[index].title;
      labDetail.querySelector('p').textContent = labSteps[index].text;
    }));
  }

  const agentSteps = [
    {
      title: 'Screener finds a starting point',
      text: 'It looks for candidates worth investigating. A name on the list still needs research, analysis, and an independent risk decision.',
      boundary: 'Screener may rank candidates, but it cannot size or place a trade.'
    },
    {
      title: 'Hunter gathers context',
      text: 'It brings together company and news information, recording which inputs were available so later checks can judge their quality.',
      boundary: 'Hunter may produce research features, but it cannot approve risk or submit an order.'
    },
    {
      title: 'Mathlete checks the market data',
      text: 'It calculates technical indicators from completed daily bars, avoiding a live candle that could change before the day ends.',
      boundary: 'Mathlete analyzes completed data; it cannot submit an order.'
    },
    {
      title: 'Brake checks the proposal',
      text: 'It reviews a proposed paper trade against risk rules and current state. Missing or conflicting input means no approval.',
      boundary: 'Brake may issue one short-lived approval, but it cannot place an order.'
    },
    {
      title: 'Sniper checks before acting',
      text: 'It uses a valid one-use approval, checks the paper-broker state again, and can submit only the approved order.',
      boundary: 'Sniper cannot change the approved ticker or size or skip revalidation.'
    },
    {
      title: 'Reconciler compares the records',
      text: 'It compares paper-broker orders and positions with the local record so an unexpected difference can be investigated.',
      boundary: 'Reconciler can reduce risk or flag a problem, but it cannot open a new position.'
    }
  ];

  const agentButtons = [...document.querySelectorAll('[data-agent-step]')];
  const agentDetail = document.querySelector('.agent-detail');
  if (agentButtons.length === agentSteps.length && agentDetail) {
    agentButtons.forEach((button, index) => button.addEventListener('click', () => {
      agentButtons.forEach((item, itemIndex) => {
        const active = itemIndex === index;
        item.setAttribute('aria-pressed', String(active));
        item.closest('li').classList.toggle('is-active', active);
      });
      agentDetail.querySelector('.agent-detail-count').textContent = `${String(index + 1).padStart(2, '0')} / 06${index === 3 ? ' · INDEPENDENT CHECK' : ''}`;
      agentDetail.querySelector('h3').textContent = agentSteps[index].title;
      agentDetail.querySelector('.agent-detail-copy').textContent = agentSteps[index].text;
      agentDetail.querySelector('.agent-detail-boundary span').textContent = agentSteps[index].boundary;
    }));
  }
})();
