const toCurrency = (price) => {
    return new Intl.NumberFormat('ru-Ru', {
        currency: 'rub',
        style: 'currency',
    }).format(price);
}
const toDate = date => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date(date));
};

document.querySelectorAll('.date').forEach(i =>{
    i.textContent = toDate(i.textContent);
});

document.querySelectorAll('.price').forEach((i) => {
    i.textContent = toCurrency(i.textContent);
});

const $card = document.querySelector('#card');

if ($card) {
    $card.addEventListener('click', event => {
        if(event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;

            fetch('card/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf,
                }
            }).then(res => res.json())
              .then(card => {
                  if(card.tests.length) {
                    const html = card.tests.map(i => {
                        return `
                        <tr>
                            <td>${i.title}</td>
                            <td>${i.count}</td>
                            <td>
                                <button class="btn btn-small js-remove" data-id="${i.id}">Удалить</button>
                            </td>
                        </tr>
                        `;
                    }).join('');

                    $card.querySelector('tbody').innerHTML = html;
                    $card.querySelector('.price').textContent = toCurrency(card.price);
                  } else {
                      $card.innerHTML = '<p>Корзина пуста</p>'
                  }
              }) 
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'));