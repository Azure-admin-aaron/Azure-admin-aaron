// The diagrams remain readable without JavaScript; selection adds a closer explanation.
(() => {
  const labSteps = [
    {
      title: 'It starts with a name',
      text: 'A device on my home network asks for a local service by name. I learned to treat that name as the start of the trail, not the whole answer.'
    },
    {
      title: 'DNS was part of the puzzle',
      text: 'A service could be healthy and still feel broken when its name did not lead to the right place. Working through DNS made that difference clearer to me.'
    },
    {
      title: 'One more hop to understand',
      text: 'The reverse proxy gave several services a clearer front door, but it also added another place a request could go astray. Learning its routes became part of the lab.'
    },
    {
      title: 'A service on the Pi',
      text: 'The request finally reaches a Docker service on the Raspberry Pi. Getting here reminds me that a running container is only one part of a setup people can actually use.'
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
      title: 'A shortlist, not an instruction',
      text: 'I wanted discovery to open a question rather than trigger an order. Screener surfaces names that might be worth studying.',
      boundary: 'Screener may rank candidates, but it cannot size or place a trade.'
    },
    {
      title: 'What an idea rests on',
      text: 'Hunter brings together company and news context. I wanted the record to show which sources were actually available, not let a polished summary hide a gap.',
      boundary: 'Hunter may produce research features, but it cannot approve risk or submit an order.'
    },
    {
      title: 'A second way to look',
      text: 'I added technical analysis from completed daily bars so a still-changing candle could not make a proposal look stronger than it was.',
      boundary: 'Mathlete analyzes completed data; it cannot submit an order.'
    },
    {
      title: 'Where I drew the line',
      text: 'Brake exists because a convincing research summary is not a risk approval. It checks the proposal and current state; missing data stops it.',
      boundary: 'Brake may issue one short-lived approval, but it cannot place an order.'
    },
    {
      title: 'Execution stays narrow',
      text: 'Even after approval, I wanted one more check against the paper broker. Sniper can submit only the order that was approved.',
      boundary: 'Sniper cannot change the approved ticker or size or skip revalidation.'
    },
    {
      title: 'Then I check what happened',
      text: 'Reconciler compares the paper broker with the local record. A mismatch is something to investigate, not a reason to quietly keep going.',
      boundary: 'Reconciler can reduce risk or flag a problem, but it cannot open a new position.'
    }
  ];

  const agentButtons = [...document.querySelectorAll('[data-agent-step]')];
  const agentDetail = document.querySelector('.agent-detail');
  if (agentButtons.length === agentSteps.length && agentDetail) {
    agentButtons.forEach((button, index) => {
      // The whole card selects its role; the button stays the keyboard and screen-reader control.
      button.closest('li').addEventListener('click', (event) => {
        if (event.target.closest('button') !== button && !event.target.closest('button')) button.click();
      });
    });
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
