document.addEventListener('DOMContentLoaded', () => {
  const notifyBtn = document.getElementById('enableNotifications');
  const statusEl = document.getElementById('notificationStatus');

  // Проверка поддержки уведомлений
  if (!('Notification' in window)) {
    if (notifyBtn) notifyBtn.style.display = 'none';
    if (statusEl) statusEl.textContent = 'Уведомления не поддерживаются';
    return;
  }

  // Обновление UI
  function updateUI() {
    const permission = Notification.permission;
    const isEnabled = permission === 'granted' && 
                     localStorage.getItem('notificationsEnabled') !== 'false';

    if (notifyBtn) {
      notifyBtn.textContent = isEnabled 
        ? 'Отключить уведомления' 
        : 'Включить уведомления';
      notifyBtn.className = isEnabled ? 'enabled' : '';
    }

    if (statusEl) {
      if (permission === 'granted') {
        statusEl.textContent = isEnabled 
          ? 'Уведомления включены' 
          : 'Уведомления отключены';
        statusEl.style.color = isEnabled ? '#ff0000' : '#990000';
      } else if (permission === 'denied') {
        statusEl.textContent = 'Уведомления заблокированы';
        statusEl.style.color = '#990000';
      } else {
        statusEl.textContent = 'Разрешение не запрошено';
        statusEl.style.color = '#990000';
      }
    }
  }

  // Показ уведомления
  async function showNotification(title, body) {
    if (Notification.permission !== 'granted' || 
        localStorage.getItem('notificationsEnabled') === 'false') {
      return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body: body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          vibrate: [200, 100, 200]
        });
        return true;
      }
      
      if (Notification.permission === 'granted') {
        new Notification(title, { 
          body: body,
          icon: '/icons/icon-192.png'
        });
        return true;
      }
    } catch (error) {
      console.error('Ошибка уведомления:', error);
      return false;
    }
  }

  // Обработчик кнопки
  if (notifyBtn) {
    notifyBtn.addEventListener('click', async () => {
      if (Notification.permission === 'granted') {
        const currentState = localStorage.getItem('notificationsEnabled') !== 'false';
        localStorage.setItem('notificationsEnabled', !currentState);
        
        if (!currentState) {
        }
      } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          localStorage.setItem('notificationsEnabled', 'true');
        }
      }
      updateUI();
    });
  }

  // Инициализация
  updateUI();

  // Экспорт функции для других модулей
  window.showNotification = showNotification;
});