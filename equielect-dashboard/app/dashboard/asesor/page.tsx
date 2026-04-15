"use client";

import styles from "./asesor.module.css";
import { useRouter } from "next/navigation";

export default function AsesorDashboard() {

  const router = useRouter();

  const irVisitas = () => {
    router.push("/visitas");
  };

  const irEmpresas = () => {
    router.push("/empresas");
  };

  return (
    <div className={styles.dashboard}>

      {/* SIDEBAR */}
      <div className={styles.sidebar}>

        <div>
          <h2>EQUIELECT</h2>

          <ul>
            <li className={styles.active}>🏠 Dashboard</li>
            <li onClick={irVisitas}>📅 Visitas</li>
            <li onClick={irEmpresas}>🏢 Empresas</li>
            <li>📊 Reportes</li>
          </ul>
        </div>

        <div className={styles.sidebarUser}>
          👤 Asesor: Juan Pérez
        </div>

      </div>

      {/* MAIN */}
      <div className={styles.main}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <span>Hoy: 15 Abril</span>
        </div>

        {/* KPIs */}
        <div className={styles.kpis}>
          <div className={styles.kpi}>
            <h3 className={styles.blue}>5</h3>
            <span>Visitas hoy</span>
          </div>

          <div className={styles.kpi}>
            <h3 className={styles.yellow}>2</h3>
            <span>Pendientes</span>
          </div>

          <div className={styles.kpi}>
            <h3 className={styles.green}>3</h3>
            <span>Completadas</span>
          </div>

          <div className={styles.kpi}>
            <h3 className={styles.red}>1</h3>
            <span>No completadas</span>
          </div>

          <div className={styles.kpi}>
            <h3>40</h3>
            <span>Este mes</span>
          </div>
        </div>

        {/* GRID */}
        <div className={styles.grid}>

          {/* TABLA */}
          <div className={styles.card}>
            <h4>Próximas visitas</h4>

            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>ACT Global</td>
                  <td>10:00 AM</td>
                  <td>
                    <span className={`${styles.status} ${styles.pending}`}>
                      Pendiente
                    </span>
                  </td>
                  <td>
                    <button className={styles.btn}>Iniciar</button>
                  </td>
                </tr>

                <tr>
                  <td>Bright Industries</td>
                  <td>03:30 PM</td>
                  <td>
                    <span className={`${styles.status} ${styles.done}`}>
                      Completada
                    </span>
                  </td>
                  <td></td>
                </tr>

                <tr>
                  <td>Gamma Corp</td>
                  <td>04:00 PM</td>
                  <td>
                    <span className={`${styles.status} ${styles.cancel}`}>
                      No realizada
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* LADO DERECHO */}
          <div>

            {/* MAPA */}
            <div className={styles.card}>
              <h4>Mapa de visitas</h4>
              <div className={styles.map}></div>
            </div>

            {/* ALERTAS */}
            <div className={styles.card} style={{ marginTop: "15px" }}>
              <h4>Alertas</h4>

              <div className={styles.alert}>
                ⚠ Tienes una visita en 30 minutos
              </div>

              <div className={styles.alert}>
                ⚠ GPS no detectado en última visita
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}