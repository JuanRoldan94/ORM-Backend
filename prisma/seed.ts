// Datos de prueba de una remisería de Rafaela. Se ejecuta con: npm run seed
// No borra nada: si ya se cargó una vez, no vuelve a cargar.
// Todos los usuarios del seed tienen la contraseña CONTRASENIA_PRUEBA.
import 'dotenv/config';
import { hashContrasenia } from '../src/common/contrasenia.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  EstadoChofer,
  EstadoDeViaje,
  EstadoOperativo,
  Roles,
} from '../src/generated/prisma/enums.js';

const CONTRASENIA_PRUEBA = 'orm12345';
const MAIL_CONTROL = 'duenio@remiseriarafaela.com.ar';

const prisma = new PrismaClient();

// Generador pseudoaleatorio con semilla: siempre se cargan los mismos datos.
let semilla = 2026;
function azar() {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const elegir = <T>(lista: T[]): T => lista[Math.floor(azar() * lista.length)];

function haceMinutos(minutos: number) {
  return new Date(Date.now() - minutos * 60_000);
}
// Día relativo a hoy (0 = hoy, -1 = ayer) a una hora dada.
function dia(desplazamiento: number, hora: number, minuto = 0) {
  const d = new Date();
  d.setDate(d.getDate() + desplazamiento);
  d.setHours(hora, minuto, 0, 0);
  return d;
}

const DIRECCIONES = [
  'Bv. Santa Fe 1450',
  'Bv. Roca 820',
  'Bv. Lehmann 1530',
  'Bv. Yrigoyen 2210',
  'Av. Brasil 650',
  'Av. Italia 1300',
  'San Martín 320',
  'Lavalle 1120',
  'Sarmiento 455',
  'Bolívar 890',
  'Belgrano 210',
  'Mitre 760',
  'Moreno 540',
  '25 de Mayo 410',
  'Alvear 1150',
  'Las Heras 380',
  'Terminal de Ómnibus Rafaela',
  'Hospital Dr. Jaime Ferré',
  'Sanatorio Nosti',
  'Plaza 25 de Mayo',
  'UTN Facultad Regional Rafaela',
  'Club Atlético de Rafaela',
  'Autódromo Ciudad de Rafaela',
  'Parque Industrial Rafaela',
  'Barrio Barranquitas',
  'Barrio Villa Rosas',
];

const OBSERVACIONES = [
  'Lleva dos valijas',
  'Pasajero con silla de ruedas plegable',
  'Esperar en la puerta, toca bocina',
  'Viaja con un bebé, necesita silla',
  'Pagar con transferencia',
  'Llamar al llegar',
];

async function main() {
  if (await prisma.usuario.findUnique({ where: { Mail: MAIL_CONTROL } })) {
    console.log('El seed ya estaba cargado: no se agregó nada.');
    return;
  }
  const contrasenia = await hashContrasenia(CONTRASENIA_PRUEBA);

  await prisma.$transaction(
    async (tx) => {
      // ---------- Usuarios ----------
      const usuarios = [
        { Nombre: 'Ricardo Bianchi', Mail: MAIL_CONTROL, Rol: Roles.Duenio },
        {
          Nombre: 'Laura Gaitán',
          Mail: 'lgaitan@remiseriarafaela.com.ar',
          Rol: Roles.Administrador,
        },
        {
          Nombre: 'Carla Rinaldi',
          Mail: 'crinaldi@remiseriarafaela.com.ar',
          Rol: Roles.Operador,
        },
        {
          Nombre: 'Matías Perren',
          Mail: 'mperren@remiseriarafaela.com.ar',
          Rol: Roles.Operador,
        },
        {
          Nombre: 'Sofía Ghiano',
          Mail: 'sghiano@remiseriarafaela.com.ar',
          Rol: Roles.Operador,
        },
      ];
      const operadores = [];
      for (const u of usuarios) {
        const creado = await tx.usuario.create({
          data: { ...u, Contrasenia: contrasenia },
        });
        if (u.Rol !== Roles.Duenio) operadores.push(creado);
      }

      // ---------- Vehículos ----------
      const datosVehiculos: [string, string, string, EstadoOperativo][] = [
        ['AF 101 KB', 'Toyota', 'Etios 2022', EstadoOperativo.Operativo],
        ['AF 238 LC', 'Chevrolet', 'Onix 2023', EstadoOperativo.Operativo],
        ['AE 977 PD', 'Fiat', 'Cronos 2022', EstadoOperativo.Operativo],
        ['AE 412 HM', 'Peugeot', '208 2021', EstadoOperativo.Operativo],
        ['AD 650 TS', 'Renault', 'Logan 2020', EstadoOperativo.Operativo],
        ['AC 309 NR', 'Volkswagen', 'Voyage 2019', EstadoOperativo.Operativo],
        ['AF 455 ZV', 'Nissan', 'Versa 2023', EstadoOperativo.NoOperativo],
        ['AB 872 QW', 'Fiat', 'Siena 2017', EstadoOperativo.NoOperativo],
      ];
      const vehiculos = [];
      for (const [Patente, Marca, Modelo, EstadoOperativo] of datosVehiculos) {
        vehiculos.push(
          await tx.vehiculo.create({
            data: { Patente, Marca, Modelo, EstadoOperativo },
          }),
        );
      }

      // ---------- Choferes (turnos de hoy) ----------
      const turnos = {
        manana: [dia(0, 6), dia(0, 14)],
        tarde: [dia(0, 14), dia(0, 22)],
        noche: [dia(-1, 22), dia(0, 6)],
      };
      const datosChoferes: [
        string,
        string,
        string,
        keyof typeof turnos,
        number | null,
        EstadoChofer,
      ][] = [
        [
          'Gustavo',
          'Bertolotti',
          '3492401122',
          'manana',
          0,
          EstadoChofer.Libre,
        ],
        ['Mariela', 'Fux', '3492405533', 'manana', 1, EstadoChofer.Libre],
        ['Hernán', 'Zbrun', '3492409817', 'tarde', 2, EstadoChofer.Libre],
        ['Daniela', 'Kauffmann', '3492413390', 'tarde', 3, EstadoChofer.Libre],
        ['Rubén', 'Imhoff', '3492417764', 'tarde', 4, EstadoChofer.Libre],
        ['Lucas', 'Giraudo', '3492420051', 'manana', 5, EstadoChofer.Libre],
        ['Sergio', 'Peretti', '3492428806', 'noche', null, EstadoChofer.Vacaciones],
        [
          'Valeria',
          'Martino',
          '3492431174',
          'noche',
          null,
          EstadoChofer.FueraDeServicio,
        ],
      ];
      const choferes = [];
      for (const [
        i,
        [Nombre, Apellido, Telefono, turno, vehiculo, estado],
      ] of datosChoferes.entries()) {
        choferes.push(
          await tx.chofer.create({
            data: {
              Nombre,
              Apellido,
              Telefono,
              NumeroLicencia: `SF-${(30451200 + i * 7919).toString()}`,
              EstadoChofer: estado,
              IngresoTurno: turnos[turno][0],
              FinalizacionTurno: turnos[turno][1],
              IdVehiculoActual:
                vehiculo === null ? null : vehiculos[vehiculo].IdVehiculo,
            },
          }),
        );
      }
      // Los que tienen auto en servicio son los que hacen viajes.
      const parejas = choferes
        .slice(0, 6)
        .map((c) => ({ chofer: c, IdVehiculo: c.IdVehiculoActual! }));

      // ---------- Clientes ----------
      const nombresClientes = [
        'Acosta, Elena',
        'Beltramino, Jorge',
        'Cravero, Silvina',
        'Dalmasso, Raúl',
        'Fenoglio, Marta',
        'Gietz, Nicolás',
        'Heinzmann, Paula',
        'Iturraspe, Graciela',
        'Kranevitter, Tomás',
        'Lorenzatti, Ana',
        'Marelli, Osvaldo',
        'Negro, Julieta',
        'Ochoa, Ramiro',
        'Pautasso, Lidia',
        'Quaglia, Federico',
        'Racca, Mónica',
        'Sola, Esteban',
        'Tibaldo, Carolina',
        'Vottero, Héctor',
        'Werner, Agustina',
      ];
      const clientes = [];
      for (const [i, ApellidoYNombre] of nombresClientes.entries()) {
        const Telefono =
          i % 3 === 0
            ? `349215${(512000 + i * 3571).toString()}`
            : `3492${(430000 + i * 4127).toString()}`;
        clientes.push(
          await tx.cliente.create({ data: { ApellidoYNombre, Telefono } }),
        );
      }

      const recorrido = () => {
        const DireccionOrigen = elegir(DIRECCIONES);
        let DireccionDestino = elegir(DIRECCIONES);
        while (DireccionDestino === DireccionOrigen)
          DireccionDestino = elegir(DIRECCIONES);
        return { DireccionOrigen, DireccionDestino };
      };
      const observacion = () => (azar() < 0.25 ? elegir(OBSERVACIONES) : null);

      // ---------- Historial: últimos 14 días ----------
      const finalizados = [];
      for (let i = 0; i < 40; i++) {
        const cliente = elegir(clientes);
        const pareja = elegir(parejas);
        const creado = dia(
          -1 - Math.floor(azar() * 14),
          6 + Math.floor(azar() * 17),
          Math.floor(azar() * 60),
        );
        const r = azar();
        const estado =
          r < 0.8
            ? EstadoDeViaje.ViajeFinalizado
            : r < 0.92
              ? EstadoDeViaje.CanceladoPorElCliente
              : EstadoDeViaje.CanceladoPorElChofer;
        // Algunos clientes cancelan antes de que se asigne un chofer.
        const sinChofer =
          estado === EstadoDeViaje.CanceladoPorElCliente && azar() < 0.5;
        const viaje = await tx.viaje.create({
          data: {
            ...recorrido(),
            Observaciones: observacion(),
            EstadoViaje: estado,
            CreadoEl: creado,
            IdCliente: cliente.IdCliente,
            IdOperador: elegir(operadores).IdUsuario,
            IdChofer: sinChofer ? null : pareja.chofer.IdChofer,
            IdVehiculo: sinChofer ? null : pareja.IdVehiculo,
          },
        });
        if (estado === EstadoDeViaje.ViajeFinalizado) finalizados.push(viaje);
      }

      // ---------- Viajes activos (ahora) ----------
      const activos: [EstadoDeViaje, number, number | null][] = [
        // estado, hace cuántos minutos se pidió, índice de la pareja chofer/vehículo
        [EstadoDeViaje.Pendiente, 2, null],
        [EstadoDeViaje.Pendiente, 6, null],
        [EstadoDeViaje.Pendiente, 11, null],
        [EstadoDeViaje.Asignado, 9, 0],
        [EstadoDeViaje.Asignado, 14, 1],
        [EstadoDeViaje.ChoferEnCamino, 18, 2],
        [EstadoDeViaje.EnCurso, 25, 3],
        [EstadoDeViaje.EnCurso, 32, 4],
      ];
      for (const [i, [estado, minutos, indicePareja]] of activos.entries()) {
        const pareja = indicePareja === null ? null : parejas[indicePareja];
        await tx.viaje.create({
          data: {
            ...recorrido(),
            Observaciones: observacion(),
            EstadoViaje: estado,
            CreadoEl: haceMinutos(minutos),
            IdCliente: clientes[i * 2].IdCliente,
            IdOperador: elegir(operadores).IdUsuario,
            IdChofer: pareja?.chofer.IdChofer ?? null,
            IdVehiculo: pareja?.IdVehiculo ?? null,
          },
        });
        // RB-2: el chofer con un viaje asignado queda En viaje.
        if (pareja) {
          await tx.chofer.update({
            where: { IdChofer: pareja.chofer.IdChofer },
            data: { EstadoChofer: EstadoChofer.EnViaje },
          });
        }
      }

      // ---------- Extravíos (el cliente es siempre el del viaje) ----------
      const objetos = [
        'Paraguas negro con mango de madera',
        'Celular Samsung con funda azul',
        'Bolsa de supermercado con mercadería',
        'Campera de jean talle M',
      ];
      for (const [i, Descripcion] of objetos.entries()) {
        const viaje = finalizados[i * 3];
        await tx.extravio.create({
          data: {
            Descripcion,
            IdViaje: viaje.IdViaje,
            IdCliente: viaje.IdCliente,
          },
        });
      }
    },
    { timeout: 60_000 },
  );

  const [u, v, c, cl, vj, ex] = await Promise.all([
    prisma.usuario.count(),
    prisma.vehiculo.count(),
    prisma.chofer.count(),
    prisma.cliente.count(),
    prisma.viaje.count(),
    prisma.extravio.count(),
  ]);
  console.log(
    `Seed cargado. Totales en la base: ${u} usuarios, ${v} vehículos, ${c} choferes, ${cl} clientes, ${vj} viajes, ${ex} extravíos.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
