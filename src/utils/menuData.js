export const menuData = {
  categories: [
    {
      id: 'tortas',
      name: 'Tortas Ahogadas',
      items: [
        {
          id: 'torta-carnitas',
          name: 'Torta Ahogada de Carnitas',
          description: 'Deliciosa torta ahogada tradicional con carnitas de puerco',
          price: 65,
          image: '/images/torta-carnitas.jpg',
          category: 'tortas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'torta-camaron',
          name: 'Torta Ahogada de Camarón',
          description: 'Torta ahogada especial con camarón fresco',
          price: 85,
          image: '/images/torta-camaron.jpg',
          category: 'tortas',
          available: true,
          preparationTime: 20
        }
      ]
    },
    {
      id: 'tacos-dorados',
      name: 'Tacos Dorados',
      items: [
        {
          id: 'doradas-papa-sencilla',
          name: 'Doradas de Papa Sencilla',
          description: 'Tacos dorados de papa',
          price: 17,
          image: '/images/tacos-dorados.jpg',
          category: 'tacos-dorados',
          available: true,
          preparationTime: 15
        },
        {
          id: 'doradas-papa-carne',
          name: 'Doradas de Papa c/Carne',
          description: 'Tacos dorados de papa con carne',
          price: 35,
          image: '/images/tacos-dorados.jpg',
          category: 'tacos-dorados',
          available: true,
          preparationTime: 15
        }
      ]
    },
    {
      id: 'carnitas',
      name: 'Órdenes de Carnitas',
      items: [
        {
          id: 'media-orden-sencillas',
          name: '1/2 Orden Sencillas',
          description: 'Media orden de carnitas sencillas',
          price: 30,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'media-orden-carne',
          name: '1/2 Orden de Carne (300g)',
          description: 'Media orden de carnitas con carne',
          price: 70,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'media-orden-con-carne',
          name: '1/2 Orden con Carne',
          description: 'Media orden con carne',
          price: 60,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'orden-carnitas-sencillas',
          name: 'Orden de Carnitas Sencillas',
          description: 'Orden completa de carnitas sencillas',
          price: 55,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'orden-carnitas',
          name: 'Orden de Carnitas',
          description: 'Orden completa de carnitas',
          price: 70,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'orden-carnitas-picadas',
          name: 'Orden de Carnitas Picadas',
          description: 'Orden de carnitas picadas',
          price: 75,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'con-tomate',
          name: 'Con Tomate',
          description: 'Orden con tomate',
          price: 80,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'media-orden-sencillas-2',
          name: '1/2 Orden Sencillas',
          description: 'Media orden sencillas',
          price: 35,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'media-orden-tomate',
          name: '1/2 Orden con Tomate',
          description: 'Media orden con tomate',
          price: 40,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'taco-suave',
          name: 'Taco Suave',
          description: 'Taco suave de carnitas',
          price: 30,
          image: '/images/carnitas.jpg',
          category: 'carnitas',
          available: true,
          preparationTime: 10
        }
      ]
    },
    {
      id: 'birria',
      name: 'Birria',
      items: [
        {
          id: 'birria-plato',
          name: 'Birria - Plato',
          description: 'Plato de birria tradicional',
          price: 120,
          image: '/images/birria.jpg',
          category: 'birria',
          available: true,
          preparationTime: 25
        },
        {
          id: 'birria-consome',
          name: 'Consomé',
          description: 'Consomé de birria',
          price: 35,
          image: '/images/birria.jpg',
          category: 'birria',
          available: true,
          preparationTime: 15
        },
        {
          id: 'birria-tacos',
          name: 'Tacos de Birria (Orden de 3)',
          description: 'Orden de 3 tacos de birria',
          price: 120,
          image: '/images/birria-tacos.jpg',
          category: 'birria',
          available: true,
          preparationTime: 20
        },
        {
          id: 'quesabirria-maiz',
          name: 'Quesabirria de Maíz',
          description: 'Quesadilla de birria en tortilla de maíz',
          price: 60,
          image: '/images/quesabirria.jpg',
          category: 'birria',
          available: true,
          preparationTime: 20
        },
        {
          id: 'quesabirria-harina',
          name: 'Quesabirria de Harina',
          description: 'Quesadilla de birria en tortilla de harina',
          price: 78,
          image: '/images/quesabirria.jpg',
          category: 'birria',
          available: true,
          preparationTime: 20
        },
        {
          id: 'super-quesabirria',
          name: 'Super Quesabirria',
          description: 'Quesabirria extra grande',
          price: 98,
          image: '/images/quesabirria.jpg',
          category: 'birria',
          available: true,
          preparationTime: 25
        }
      ]
    },
    {
      id: 'carne-jugo',
      name: 'Carne en su Jugo',
      items: [
        {
          id: 'carne-jugo-chico',
          name: 'Plato Chico',
          description: 'Plato chico de carne en su jugo',
          price: 110,
          image: '/images/carne-jugo.jpg',
          category: 'carne-jugo',
          available: true,
          preparationTime: 25
        },
        {
          id: 'carne-jugo-grande',
          name: 'Plato Grande',
          description: 'Plato grande de carne en su jugo',
          price: 140,
          image: '/images/carne-jugo.jpg',
          category: 'carne-jugo',
          available: true,
          preparationTime: 25
        },
        {
          id: 'carne-jugo-llevar',
          name: 'Para Llevar',
          description: 'Carne en su jugo para llevar',
          price: 30,
          image: '/images/carne-jugo.jpg',
          category: 'carne-jugo',
          available: true,
          preparationTime: 20
        }
      ]
    },
    {
      id: 'tostadas',
      name: 'Tostadas',
      items: [
        {
          id: 'tostadas-pata',
          name: 'Tostadas de Pata',
          description: 'Deliciosas tostadas de pata',
          price: 40,
          image: '/images/tostadas.jpg',
          category: 'tostadas',
          available: true,
          preparationTime: 15
        }
      ]
    },
    {
      id: 'quesadillas',
      name: 'Quesadillas',
      items: [
        {
          id: 'quesadilla-maiz-sencilla',
          name: 'Quesadilla de Maíz - Sencilla',
          description: 'Quesadilla de maíz sencilla',
          price: 25,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'quesadilla-maiz-carnitas',
          name: 'Quesadilla de Maíz - Con Carnitas',
          description: 'Quesadilla de maíz con carnitas',
          price: 40,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'quesadilla-maiz-camaron',
          name: 'Quesadilla de Maíz - Con Camarón',
          description: 'Quesadilla de maíz con camarón',
          price: 65,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'quesadilla-harina-sencilla',
          name: 'Quesadilla de Harina - Sencilla',
          description: 'Quesadilla de harina sencilla',
          price: 45,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'quesadilla-harina-carnitas',
          name: 'Quesadilla de Harina - Con Carnitas',
          description: 'Quesadilla de harina con carnitas',
          price: 70,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'quesadilla-harina-camaron',
          name: 'Quesadilla de Harina - Con Camarón',
          description: 'Quesadilla de harina con camarón',
          price: 112,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 15
        },
        {
          id: 'superquesadilla-sencilla',
          name: 'Superquesadilla - Sencilla',
          description: 'Superquesadilla sencilla',
          price: 65,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'superquesadilla-carnitas',
          name: 'Superquesadilla - Con Carnitas',
          description: 'Superquesadilla con carnitas',
          price: 90,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 20
        },
        {
          id: 'superquesadilla-camaron',
          name: 'Superquesadilla - Con Camarón',
          description: 'Superquesadilla con camarón',
          price: 120,
          image: '/images/quesadilla.jpg',
          category: 'quesadillas',
          available: true,
          preparationTime: 20
        }
      ]
    },
    {
      id: 'consome',
      name: 'Consomé',
      items: [
        {
          id: 'tacos-consome',
          name: 'Tacos (Orden de 3)',
          description: 'Orden de 3 tacos de consomé',
          price: 145,
          image: '/images/consome.jpg',
          category: 'consome',
          available: true,
          preparationTime: 25
        }
      ]
    }
  ]
};

export const restaurantInfo = {
  name: 'Tortas Ahogadas Guadalajara',
  address: 'Avenida de las Amazonas, Col. Ensueños, 54740 Cuautitlán Izcalli, Méx.',
  phone: '5524318416',
  schedule: {
    lunes: { open: false },
    martes: { open: false },
    miercoles: { open: true, hours: '1:00 PM - 6:00 PM' },
    jueves: { open: true, hours: '1:00 PM - 6:00 PM' },
    viernes: { open: true, hours: '1:00 PM - 6:00 PM' },
    sabado: { open: true, hours: '10:00 AM - 5:00 PM' },
    domingo: { open: true, hours: '10:00 AM - 5:00 PM' }
  },
  delivery: {
    baseFee: 40,
    freeDeliveryMinimum: 1000,
    maxDistance: 15,
    estimatedTime: '30-45 min'
  }
};