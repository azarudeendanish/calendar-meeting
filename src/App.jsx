import React, { useState } from 'react'
import './App.css'
import EVENT from "./api/calendar_meeting.json";
import EVENTS from "./api/calendarfromtoenddate.json";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"
import { Tooltip } from 'react-tooltip';
import { format } from 'date-fns';
import Modal from 'react-modal';

const EventItem = ({ eventItem, handleEventItemClick }) => {
  function test(params) {
    console.log('test function',params);
  }
  const start = new Date(eventItem.start)
  const end = new Date(eventItem.end)
  const dateString = format(start, 'dd MMM yyyy')
  const timeStringStart = format(start, 'HH:mm ')
  const timeStringEnd = format(end, 'HH:mm')

  return (
    <div className={'single-event-item'} onClick={() => test(eventItem)}>
      <div className='single-event-job-request'>
        {eventItem.job_id.jobRequest_Title}
      </div>
      <div className='single-event-user'>
        {eventItem.summary} | Interviewer: {eventItem.user_det.handled_by.firstName}
      </div>
      <div className='single-event-user'>
        Date: {dateString} | Time: {timeStringStart} - {timeStringEnd}
      </div>
    </div>
  )
}

const EventsCollection = ({ events, handleEventItemClick }) => {
  return (
    <div>
      {events.map((event, index) => <EventItem key={index} eventItem={event} handleEventItemClick={handleEventItemClick} />)}
    </div>
  )
}
function App() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [eventItem, setEventItem] = useState(null);

  function handleEventItemClick(event) {
    setEventItem(event);
    openModal();
  }
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const eventMap = {};
  EVENTS.forEach((item) => {
    const itemDate = new Date(item.start);
    const dateString = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}-${itemDate.getDate()}`;
    if (!eventMap.hasOwnProperty(dateString)) {
      eventMap[dateString] = {
        title: item.summary,
        start: new Date(itemDate),
        end: new Date(item.end),
        text: item.desc,
        extendedProps: {
          events: [
            item
          ]
        }
      };
    } else {
      eventMap[dateString].extendedProps.events.push(item)
    }
  });
  const calendarEvents = Object.values(eventMap);
  const calendarEventss = EVENTS.map((item) => {
    const itemDate = new Date(item.start);
    return {
      id: item.id,
      title: item.summary,
      start: new Date(itemDate),
      end: new Date(item.end),
      text: item.desc,
      extendedProps: { ...item },
      groupId: `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}-${itemDate.getDate()}`,
    }
  })

  function renderEventContent(eventInfo) {
    const items = eventInfo.event._def.extendedProps.events[0];
    const length = eventInfo.event._def.extendedProps.events.length




    const jobTitle = items.job_id.jobRequest_Title;
    const interviewer = items.user_det.handled_by.firstName
    const startDate = new Date(items.start)
    const endDate = new Date(items.end)
    const time = `${formatTime(startDate)} - ${formatTime(endDate)}`
    const startDateAll = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`

    function formatTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      let strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
    return (
      <>
        <Tooltip
          id={`my-tooltip-click-${startDateAll}`}
          events={['click']}
          data-tooltip-place='right'
          className='customTooltip'
          closeEvents={{click: false}}
          afterHide={()=>handleEventItemClick(eventInfo)}
        >
          <EventsCollection events={eventInfo.event._def.extendedProps.events} handleEventItemClick={handleEventItemClick} />
        </Tooltip>
        <div className='eventBox' data-tooltip-id={`my-tooltip-click-${startDateAll}`} style={{ color: '#000', backgroundColor: "#fff", borderLeft: "15px solid blue", borderRadius: "3px", boxShadow: "rgb(0 0 0 / 67%) 0px 2px 25px", padding: "8px", height: 'auto', width: '-webkit-fill-available', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>{length > 1 && <span className='notifi'>{length}</span>}{jobTitle} <br></br> Interviewer: {interviewer}<br></br> Time: {time}</div>
      </>
    )
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        // weekends={false}
        events={calendarEvents}
        eventContent={renderEventContent}
        headerToolbar={{
          left: `prev,next today`,
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth,dayGridYear",
        }}
        title={{ year: 'numeric', month: 'long' }}
        height={'90vh'}
      />

      {eventItem && <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{ backgroundColor: 'red' }}
        contentLabel="Example Modal"
      >
        <button onClick={closeModal}>close</button>
        <div className={'single-event-model'}>
          <div className='single-event-model-wrapper'>
            <div className='modal-left'>
              <p>Interview With: {eventItem.user_det.candidate.candidate_firstName}</p>
              <p>Position: {eventItem.user_det.job_id.jobRequest_Title}</p>
              <p>Created By: </p>
              <p>Interview Date: {dateString}</p>
              <p>Interview Time: {timeStringStart} - {timeStringEnd}</p>
              <p> Inertview viaL Google Meet</p>
              <button className='button--resume'> Resume.docx</button>
              <button className='button--adhar'> Resume.docx</button>
            </div>
            <div className='model-right'>
              <div>
                Image
              </div>
              <button> Join</button>
            </div>
          </div>
        </div>
      </Modal>
      }
    </>
  )
}


export default App;
