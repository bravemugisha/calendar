// import 'preact/debug';
import { createRoot } from 'react-dom/client';

// Local example shell utilities live in examples/styles/tailwind.css.
// DayFlow component styles stay on the library side.
import '@/styles/tailwind-components.css';
import './styles/tailwind.css';
import CalendarExample from './defaultCalendarExample/defaultCalendarExample';

const container = document.querySelector('#root');
if (container) {
  const root = createRoot(container);
  root.render(<CalendarExample />);
}
