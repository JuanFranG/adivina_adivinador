$(document).ready(function() {
    // Variables del juego
    const MAX_INTENTOS = 10;
    let numeroSecreto = generarNumero();
    let intentos = 0;
    let juegoTerminado = false;
    let mejorAproximacion = 100;
    let historialIntentos = []; // Array para guardar el historial
    let mejorRacha = localStorage.getItem('mejorRacha') || null;
    
    // Mostrar mejor racha guardada
    if (mejorRacha) {
        $('#mejor-racha').text(mejorRacha);
    }
    
    // Cargar historial de partidas anteriores desde sessionStorage
    cargarHistorialSesion();
    
    // Función para generar número aleatorio
    function generarNumero() {
        return Math.floor(Math.random() * 101);
    }
    
    // Función para guardar historial en sessionStorage
    function guardarHistorialSesion() {
        const datosPartida = {
            fecha: new Date().toLocaleString(),
            numeroSecreto: numeroSecreto,
            intentos: intentos,
            gano: historialIntentos.length > 0 && historialIntentos[historialIntentos.length - 1].numero === numeroSecreto,
            historialIntentos: historialIntentos,
            mejorAproximacion: mejorAproximacion,
            porcentajeCercania: calcularPorcentajeCercania(mejorAproximacion)
        };
        
        // Obtener historial de partidas existente
        let historialPartidas = JSON.parse(sessionStorage.getItem('historialPartidas')) || [];
        
        // Agregar nueva partida
        historialPartidas.push(datosPartida);
        
        // Guardar en sessionStorage
        sessionStorage.setItem('historialPartidas', JSON.stringify(historialPartidas));
    }
    
    // Función para cargar y mostrar historial de sesión
    function cargarHistorialSesion() {
        const historialPartidas = JSON.parse(sessionStorage.getItem('historialPartidas')) || [];
        
        if (historialPartidas.length > 0) {
            console.log('📊 Historial de partidas en esta sesión:', historialPartidas);
        }
    }
    
    // Función para obtener estadísticas de la sesión
    function obtenerEstadisticasSesion() {
        const historialPartidas = JSON.parse(sessionStorage.getItem('historialPartidas')) || [];
        
        if (historialPartidas.length === 0) {
            return null;
        }
        
        const partidasGanadas = historialPartidas.filter(p => p.gano).length;
        const partidasPerdidas = historialPartidas.filter(p => !p.gano).length;
        const totalPartidas = historialPartidas.length;
        const promedioIntentos = historialPartidas.reduce((sum, p) => sum + p.intentos, 0) / totalPartidas;
        
        return {
            totalPartidas,
            partidasGanadas,
            partidasPerdidas,
            porcentajeVictorias: ((partidasGanadas / totalPartidas) * 100).toFixed(1),
            promedioIntentos: promedioIntentos.toFixed(1)
        };
    }
    
    // Función para calcular porcentaje de cercanía
    function calcularPorcentajeCercania(mejorDiferencia) {
        const porcentaje = ((100 - mejorDiferencia) / 100) * 100;
        return porcentaje.toFixed(1);
    }
    
    // Función para calcular la distancia y dar pistas
    function calcularPista(intento) {
        const diferencia = Math.abs(numeroSecreto - intento);
        
        if (diferencia < mejorAproximacion) {
            mejorAproximacion = diferencia;
        }
        
        if (diferencia === 0) {
            return {
                clase: 'exacto',
                emoji: '🎉',
                mensaje: '¡EXACTO! ¡Lo adivinaste!',
                color: '#00ff00'
            };
        } else if (diferencia <= 1) {
            return {
                clase: 'muy-caliente',
                emoji: '🔥🔥🔥',
                mensaje: '¡ARDIENDO! Estás a menos de 5',
                color: '#ff0000'
            };
        } else if (diferencia <= 10) {
            return {
                clase: 'caliente',
                emoji: '🔥🔥',
                mensaje: '¡MUY CALIENTE! Estás a menos de 15',
                color: '#ff4500'
            };
        } else if (diferencia <= 15) {
            return {
                clase: 'tibio-caliente',
                emoji: '🔥',
                mensaje: '¡CALIENTE! Estás a menos de 30',
                color: '#ff6600'
            };
        } else if (diferencia <= 30) {
            return {
                clase: 'tibio',
                emoji: '😊',
                mensaje: 'TIBIO. Estás a menos de 50',
                color: '#ffaa00'
            };
        } else if (diferencia <= 45) {
            return {
                clase: 'templado',
                emoji: '🤔',
                mensaje: 'TEMPLADO. Estás a menos de 100',
                color: '#ffdd00'
            };
        } else if (diferencia <= 50) {
            return {
                clase: 'fresco',
                emoji: '😐',
                mensaje: 'FRESCO. Estás a menos de 200',
                color: '#aaddff'
            };
        } else if (diferencia <= 60) {
            return {
                clase: 'frio',
                emoji: '❄️',
                mensaje: 'FRÍO. Estás a menos de 350',
                color: '#66bbff'
            };
        } else if (diferencia <= 70) {
            return {
                clase: 'muy-frio',
                emoji: '❄️❄️',
                mensaje: '¡MUY FRÍO! Estás a menos de 500',
                color: '#3399ff'
            };
        } else {
            return {
                clase: 'congelado',
                emoji: '🥶',
                mensaje: '¡CONGELADO! Estás muy lejos',
                color: '#0066cc'
            };
        }
    }
    
    // Función para agregar al historial
    function agregarHistorial(numero, pista) {
        const direccion = numero < numeroSecreto ? '⬆️ Mayor' : (numero > numeroSecreto ? '⬇️ Menor' : '✅ Correcto');
        
        // Guardar en el array de historial
        historialIntentos.push({
            intento: intentos,
            numero: numero,
            pista: pista.mensaje,
            direccion: direccion,
            diferencia: Math.abs(numeroSecreto - numero)
        });
        
        if ($('.historial-vacio').length) {
            $('#historial').empty();
        }
        
        const item = $(`
            <div class="historial-item ${pista.clase}">
                <span class="historial-numero">${numero}</span>
                <span class="historial-pista">${pista.emoji} ${pista.mensaje}</span>
                <span class="historial-direccion">${direccion}</span>
            </div>
        `);
        
        $('#historial').prepend(item);
    }
    
    // Función para actualizar indicador
    function actualizarIndicador(pista) {
        $('#indicador').removeClass().addClass('indicador-distancia ' + pista.clase);
        $('#indicador .emoji').text(pista.emoji);
        $('#indicador .mensaje').text(pista.mensaje);
        $('#indicador').css('background', `linear-gradient(135deg, ${pista.color}33, ${pista.color}11)`);
        $('#indicador').css('border-color', pista.color);
    }
    
    // Función para mostrar pantalla de GANADOR
    function mostrarVictoria() {
        juegoTerminado = true;
        
        // Guardar partida en sessionStorage
        guardarHistorialSesion();
        
        // Obtener estadísticas
        const stats = obtenerEstadisticasSesion();
        
        // Actualizar mejor racha
        if (!mejorRacha || intentos < mejorRacha) {
            mejorRacha = intentos;
            localStorage.setItem('mejorRacha', mejorRacha);
            $('#mejor-racha').text(mejorRacha);
        }
        
        Swal.fire({
            icon: 'success',
            title: '🏆 ¡GANASTE! 🏆',
            html: `
                <div style="text-align: center;">
                    <p style="font-size: 1.3rem; margin-bottom: 15px;">
                        ¡Adivinaste el número <strong style="color: #10b981; font-size: 1.8rem;">${numeroSecreto}</strong>!
                    </p>
                    <p style="font-size: 1.1rem;">
                        Lo lograste en <strong>${intentos}</strong> de ${MAX_INTENTOS} intentos
                    </p>
                    ${intentos === parseInt(mejorRacha) ? '<p style="color: #fbbf24; font-weight: bold; font-size: 1.3rem; margin-top: 15px;">⭐ ¡NUEVO RÉCORD! ⭐</p>' : ''}
                    <div style="background: #f0fdf4; padding: 12px; border-radius: 10px; margin-top: 15px; text-align: left;">
                        <p style="font-weight: bold; margin-bottom: 8px; color: #166534;">📊 Estadísticas de la sesión:</p>
                        <p style="font-size: 0.9rem; color: #555;">Partidas jugadas: <strong>${stats.totalPartidas}</strong></p>
                        <p style="font-size: 0.9rem; color: #555;">Victorias: <strong>${stats.partidasGanadas}</strong> | Derrotas: <strong>${stats.partidasPerdidas}</strong></p>
                        <p style="font-size: 0.9rem; color: #555;">% de victorias: <strong>${stats.porcentajeVictorias}%</strong></p>
                    </div>
                </div>
            `,
            confirmButtonText: '🎮 Jugar de nuevo',
            confirmButtonColor: '#10b981',
            allowOutsideClick: false,
            backdrop: `rgba(16, 185, 129, 0.4)`
        }).then((result) => {
            if (result.isConfirmed) {
                reiniciarJuego();
            }
        });
    }
    
    // Función para mostrar pantalla de PERDEDOR
    function mostrarDerrota() {
        juegoTerminado = true;
        const porcentajeCercania = calcularPorcentajeCercania(mejorAproximacion);
        
        // Guardar partida en sessionStorage
        guardarHistorialSesion();
        
        // Obtener estadísticas
        const stats = obtenerEstadisticasSesion();
        
        Swal.fire({
            icon: 'error',
            title: '💔 ¡PERDISTE! 💔',
            html: `
                <div style="text-align: center;">
                    <p style="font-size: 1.1rem; margin-bottom: 15px;">
                        Se acabaron tus ${MAX_INTENTOS} intentos
                    </p>
                    <p style="font-size: 1rem; margin-bottom: 10px;">
                        El número secreto era:
                    </p>
                    <p style="font-size: 2.5rem; font-weight: bold; color: #e11d48; margin-bottom: 15px;">
                        ${numeroSecreto}
                    </p>
                    <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin-top: 10px;">
                        <p style="font-size: 0.95rem; color: #666; margin-bottom: 5px;">
                            Tu mejor aproximación estuvo a ${mejorAproximacion} del número
                        </p>
                        <p style="font-size: 1.4rem; font-weight: bold; color: #f97316;">
                            Cercanía: ${porcentajeCercania}%
                        </p>
                    </div>
                    <div style="background: #fef2f2; padding: 12px; border-radius: 10px; margin-top: 15px; text-align: left;">
                        <p style="font-weight: bold; margin-bottom: 8px; color: #991b1b;">📊 Estadísticas de la sesión:</p>
                        <p style="font-size: 0.9rem; color: #555;">Partidas jugadas: <strong>${stats.totalPartidas}</strong></p>
                        <p style="font-size: 0.9rem; color: #555;">Victorias: <strong>${stats.partidasGanadas}</strong> | Derrotas: <strong>${stats.partidasPerdidas}</strong></p>
                        <p style="font-size: 0.9rem; color: #555;">% de victorias: <strong>${stats.porcentajeVictorias}%</strong></p>
                    </div>
                </div>
            `,
            confirmButtonText: '🔄 Intentar de nuevo',
            confirmButtonColor: '#e11d48',
            allowOutsideClick: false,
            backdrop: `rgba(225, 29, 72, 0.4)`
        }).then((result) => {
            if (result.isConfirmed) {
                reiniciarJuego();
            }
        });
    }
    
    // Función principal de adivinar
    function adivinar() {
        if (juegoTerminado) {
            Swal.fire({
                icon: 'info',
                title: 'Juego terminado',
                text: 'Presiona "Nuevo Juego" para volver a jugar',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        const input = $('#numero-input');
        const valor = input.val().trim();
        
        if (valor === '') {
            Swal.fire({
                icon: 'warning',
                title: '¡Espera!',
                text: 'Debes ingresar un número',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        const numero = parseInt(valor);
        
        if (isNaN(numero) || numero < 0 || numero > 100) {
            Swal.fire({
                icon: 'error',
                title: 'Número inválido',
                text: 'El número debe estar entre 0 y 100',
                confirmButtonColor: '#d33'
            });
            return;
        }
        
        intentos++;
        $('#intentos').text(intentos + '/' + MAX_INTENTOS);
        
        const pista = calcularPista(numero);
        
        actualizarIndicador(pista);
        agregarHistorial(numero, pista);
        
        input.val('');
        input.focus();
        
        if (numero === numeroSecreto) {
            mostrarVictoria();
            return;
        }
        
        if (intentos >= MAX_INTENTOS) {
            mostrarDerrota();
            return;
        }
        
        if (intentos === MAX_INTENTOS - 2) {
            Swal.fire({
                icon: 'warning',
                title: '⚠️ ¡Atención!',
                text: '¡Solo te quedan 2 intentos!',
                timer: 1500,
                showConfirmButton: false
            });
        } else if (intentos === MAX_INTENTOS - 1) {
            Swal.fire({
                icon: 'warning',
                title: '🚨 ¡ÚLTIMO INTENTO!',
                text: '¡Esta es tu última oportunidad!',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
    
    // Función para reiniciar
    function reiniciarJuego() {
        numeroSecreto = generarNumero();
        intentos = 0;
        juegoTerminado = false;
        mejorAproximacion = 100;
        historialIntentos = []; // Limpiar historial de la partida actual
        
        $('#intentos').text('0/' + MAX_INTENTOS);
        $('#numero-input').val('');
        $('#historial').html('<p class="historial-vacio">Aún no hay intentos</p>');
        $('#indicador').removeClass().addClass('indicador-distancia');
        $('#indicador .emoji').text('🤔');
        $('#indicador .mensaje').text('¡Ingresa tu primer número!');
        $('#indicador').css('background', '');
        $('#indicador').css('border-color', '');
        
        Swal.fire({
            icon: 'info',
            title: '¡Nuevo juego!',
            text: 'He pensado en un nuevo número del 0 al 100',
            timer: 1500,
            showConfirmButton: false
        });
        
        $('#numero-input').focus();
    }
    
    // Función para ver historial completo de la sesión
    function verHistorialSesion() {
        const historialPartidas = JSON.parse(sessionStorage.getItem('historialPartidas')) || [];
        
        if (historialPartidas.length === 0) {
            Swal.fire({
                icon: 'info',
                title: '📋 Historial de Sesión',
                text: 'Aún no has jugado ninguna partida en esta sesión',
                confirmButtonColor: '#3085d6'
            });
            return;
        }
        
        let htmlHistorial = '<div style="max-height: 300px; overflow-y: auto; text-align: left;">';
        
        historialPartidas.forEach((partida, index) => {
            const resultado = partida.gano ? '✅ Victoria' : '❌ Derrota';
            const color = partida.gano ? '#10b981' : '#e11d48';
            
            htmlHistorial += `
                <div style="background: #f8f9fa; padding: 10px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${color};">
                    <p style="font-weight: bold; margin-bottom: 5px;">Partida ${index + 1} - ${resultado}</p>
                    <p style="font-size: 0.85rem; color: #666;">Número: <strong>${partida.numeroSecreto}</strong></p>
                    <p style="font-size: 0.85rem; color: #666;">Intentos: <strong>${partida.intentos}</strong></p>
                    <p style="font-size: 0.85rem; color: #666;">Cercanía: <strong>${partida.porcentajeCercania}%</strong></p>
                    <p style="font-size: 0.75rem; color: #999;">${partida.fecha}</p>
                </div>
            `;
        });
        
        htmlHistorial += '</div>';
        
        const stats = obtenerEstadisticasSesion();
        
        Swal.fire({
            title: '📋 Historial de Sesión',
            html: `
                <div style="background: #e0f2fe; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    <p><strong>Total:</strong> ${stats.totalPartidas} | <strong>Ganadas:</strong> ${stats.partidasGanadas} | <strong>Perdidas:</strong> ${stats.partidasPerdidas}</p>
                    <p><strong>% Victorias:</strong> ${stats.porcentajeVictorias}% | <strong>Promedio intentos:</strong> ${stats.promedioIntentos}</p>
                </div>
                ${htmlHistorial}
            `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#3085d6',
            width: '500px'
        });
    }
    
    // Event Listeners con jQuery
    $('#btn-adivinar').on('click', adivinar);
    
    $('#numero-input').on('keypress', function(e) {
        if (e.which === 13) {
            adivinar();
        }
    });
    
    $('#btn-reiniciar').on('click', function() {
        Swal.fire({
            title: '¿Reiniciar juego?',
            text: 'Se perderá el progreso actual',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, reiniciar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                reiniciarJuego();
            }
        });
    });
    
    // Botón para ver historial (se puede agregar al HTML si se desea)
    $('#btn-historial').on('click', verHistorialSesion);
    
    // Inicializar contador
    $('#intentos').text('0/' + MAX_INTENTOS);
    
    // Focus inicial
    $('#numero-input').focus();
    
    // Mensaje de bienvenida con estadísticas si existen
    const statsInicio = obtenerEstadisticasSesion();
    let mensajeStats = '';
    
    if (statsInicio) {
        mensajeStats = `<p style="margin-top: 15px; padding: 10px; background: #e0f2fe; border-radius: 8px; font-size: 0.9rem;">
            📊 Esta sesión: ${statsInicio.partidasGanadas} victorias de ${statsInicio.totalPartidas} partidas
        </p>`;
    }
    
    Swal.fire({
        title: '¡Bienvenido al juego!',
        html: `
            <p>He pensado en un número del <strong>0 al 100</strong></p>
            <p>Tienes <strong>${MAX_INTENTOS} intentos</strong> para adivinarlo</p>
            <p style="margin-top: 10px;">Te daré pistas de qué tan cerca estás:</p>
            <p>🥶 Congelado → 🔥🔥🔥 Ardiendo</p>
            ${mensajeStats}
        `,
        icon: 'info',
        confirmButtonText: '¡Empezar!',
        confirmButtonColor: '#3085d6'
    });
});
