import { TrainingSettings } from '../toRemove/logItem';
import { Instantiator } from '@jwmb/pixelmagic/lib/toReplace/instantiator';

export class TrainingPlanTestBase {
    static getTrainingPlanSettings(uuid: string) {
        return <TrainingPlanTestBase>Instantiator.i.instantiateNoThrow('TrainingPlanTest_' + uuid.replace('test', ''));
        // return <TrainingPlanTestBase>ObjectXUtils.instantiateNoThrow('TrainingPlanTest_' + uuid.replace('test', ''));
    }
    static getTrainingPlanFromAccountName(uuid: string): any {
        const obj = TrainingPlanTestBase.getTrainingPlanSettings(uuid); // getTrainingPlan(uuid.replace("test", ""));
        return obj ? obj.getTrainingPlan() : null;
    }
    // static getTrainingPlan(id: string): any {
    //    var obj = <TrainingPlanTestBase>ObjectXUtils.instantiate("TrainingPlanTest_" + id);
    //    return obj.getTrainingPlan();
    // }
    getTrainingPlan(): any {
        return null;
    }
    get training_settings(): TrainingSettings {
        return null;
    }
    get training_plan() {
        return this.getTrainingPlan();
    }
    get urlParameters() {
        return null;
    }

    get user_data() {
        return null;
    }

    get exercise_stats() {
        return null;
    }
}

export class TrainingPlanTest_account extends TrainingPlanTestBase {
    get training_settings(): TrainingSettings {
        return <TrainingSettings><any>{ 'customData': { 'unlockAllPlanets': true, 'canLogout': true, 'menuButton': true } };
    }
    get exercise_stats() {
        return { triggerData: { MagicCutSceneTriggerAction_magic_intro: true } };
    }
    getTrainingPlan() {
        return {
            'metaphor': 'Magical', // "Magical",//"PlanetRace",
            'autoConnectType': 'THREE-WAY', 'isTraining': true, 'triggers': [],
          'tests': [
            {
              'title': 'Alternatives',
              'id': 'Alternatives',
              'phases': [
                  {
                      'phaseType': 'TEST',
                      'endCriteriaData': {
                          'end': {
                              'type': 'TIME'
                          }
                      },
                      'type': 'PhaseBase', // PhaseAlternatives
                      'problemGeneratorData': {
                          'problems': [
                              {
                                  'type': 'ProblemAlternatives',
                                  'problemString': 'IMG,SND|banan|WORD|banan,blå,grön'
                              },
                              {
                                  'type': 'ProblemAlternatives',
                                  'problemString': 'IMG|apa|WORD|kaka,boll,apa'
                              },
                              {
                                  'type': 'ProblemAlternatives',
                                  'problemString': 'WORD|apa|IMG|brun,svans,apa'
                              },
                              {
                                  'type': 'ProblemAlternatives',
                                  'problemString': 'WORD|aepple|IMG,WORD|aepple,blå,hus'
                              },
                              {
                                  'type': 'ProblemAlternatives',
                                  'problemString': 'IMG,WORD|taxi|IMG|röd,taxi,apa'
                              }
                          ]
                      }
                  }
              ]
          },
                {
                    'title': 'CountOut',
                    'id': 'countout',
                    'phases': [
                        {
                            'type': 'PhaseBase',
                            'phaseType': 'TEST',
                            'problemGeneratorData': {
                                'problems': [
                                    {
                                        'type': 'COUNT_OUT',
                                        'problemString': '3_20_001'
                                    },
                                    {
                                        'type': 'COUNT_OUT',
                                        'problemString': '9_20_002'
                                    },
                                    {
                                        'type': 'COUNT_OUT',
                                        'problemString': '12_20_003'
                                    },
                                    {
                                        'type': 'COUNT_OUT',
                                        'problemString': '19_20_001'
                                    },
                                    {
                                        'type': 'COUNT_OUT',
                                        'problemString': '15_20_002'
                                    },
                                    {
                                        'type': 'COUNT_OUT',
                                        'problemString': '16_20_003'
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    'title': 'Memo Crush',
                    'id': 'WM_crush',
                    'phases': [
                        {
                            'phaseType': 'TEST',
                            'type': 'PhaseMemoCrush',
                            'endCriteriaData': {
                                'target': {
                                    'type': 'CORRECT_TOTAL',
                                    'dynamicValue': {
                                        'type': 'MEDALS',
                                        'values': [
                                            5,
                                            6,
                                            7
                                        ],
                                        'adaptAfterNoOfFails': 2
                                    }
                                },
                                'end': {
                                    'type': 'INCORRECT_TOTAL',
                                    'value': 5
                                }
                            },
                            'showDialogBetween': true,
                            'stimuliType': 'WM_CRUSH'
                        }
                    ]
                },
                {
                    'title': 'NBack',
                    'id': 'NBack',
                    'phases': [
                        {
                            'phaseType': 'TEST',
                            'endCriteriaData': {
                                // "target": { "type": "CORRECT_TOTAL", "value": 11 },
                                // "end": { "type": "QUESTIONS_TOTAL", "value": 11 }
                                // "end": { "type": "TIME", "value": 90 }
                            },
                            'type': 'PhaseNBack'
                        }
                    ]
                },
                {
                    'title': 'Boolean',
                    'id': 'boolean',
                    'isTest': false,
                    'phases': [
                        {
                            'type': 'PhaseBoolean',
                            'phaseType': 'TEST',
                            'endCriteriaData': {
                                'target': { 'type': 'CORRECT_TOTAL', 'value': 7 },
                                'fail': { 'type': 'INCORRECT_TOTAL', 'value': 3 },
                                'end': { 'type': 'TIME', 'value': 500 }
                            },
                            'problemGeneratorData': {
                                'generator': 'ProblemGeneratorBoolean',
                                'problemProps': {
                                    'correctBeforeNext': true
                                }
                            }
                        }
                    ]
                },
                {
                    'title': 'visuoSpatial no guide',
                    'id': 'visuoSpatialRotation',
                    'isTest': false,
                    'phases': [
                        {
                            'type': 'PhaseRotation',
                            'phaseType': 'TEST',
                            'endCriteriaData': {
                                'target': { 'type': 'CORRECT_TOTAL', 'value': 7 },
                                'end': { 'type': 'INCORRECT_TOTAL', 'value': 5 }
                            }
                        }
                    ]
                },
                {
                    'title': 'TenPals',
                    'id': 'TenPals',
                    'progVisualizer': 'fullScreen',
                    'progVisualizerData': {
                        'progressIndicatorType': 'END'
                    },
                    'phases': [
                        {
                            'phaseType': 'TEST',
                            'endCriteriaData': {
                                'target': { 'type': 'CORRECT_TOTAL', 'value': 11 },
                                'end': { 'type': 'TIME', 'value': 90 }
                            },
                            'type': 'PhaseNPals'
                        }
                    ]
                },
                {
                    'title': 'Tangram',
                    'id': 'tangram01',
                    'progVisualizer': 'fullScreen',
                    'progVisualizerData': {
                        'progressIndicatorType': 'END'
                    },
                    'phases': [
                        {
                            'type': 'PhaseTangram',
                            'phaseType': 'TEST',
                            'medalMode': 'THREE_WINS',
                            'problemGeneratorData': {
                                'problemProps': {
                                    'hintDelay': 60
                                }
                            },
                            'endCriteriaData': {
                                'target': {
                                    'type': 'CORRECT_TOTAL',
                                    'value': 3
                                },
                                'end': {
                                    'type': 'TIME',
                                    'value': 90
                                }
                            }
                        }
                    ]
                },
                {
                    'title': 'Short Race',
                    'id': 'shortrace',
                    'phases': [
                        {
                            'type': 'PhaseBase',
                            'phaseType': 'TEST',
                            'endCriteriaData': {
                                'target': {
                                    'type': 'CORRECT_TOTAL',
                                    'dynamicValue': {
                                        'type': 'MEDALS', 'values':
                                            [3, 4, 5], adaptAfterNoOfFails: 2
                                    }
                                },
                                'fail': { 'type': 'INCORRECT_TOTAL', 'value': 3 },
                                'end': { 'type': 'TIME', 'value': 10 }
                            },
                            'problemGeneratorData': {
                                'problemProps': {
                                    'correctBeforeNext': true
                                },
                                'problems': [
                                    {
                                        'type': 'MISSING_SYMBOL',
                                        'problemString': '1+2=?,3'
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    'id': 'wm_numbers',
                    'title': 'WM Numbers',
                    'phases': [
                        {
                            'phaseType': 'TEST',
                            'type': 'PhaseWorkingMemory',
                            'endCriteriaData': {
                                'target': {'type': 'CORRECT_TOTAL', 'value': 7},
                                'end': {'type': 'INCORRECT_TOTAL', 'value': 5}
                            },
                            'stimuliType': 'WM_NUMBERS' // WM_GRID WM_MOVING WM_NUMBERS WM_3DGRID WM_CIRCLE
                        }
                    ]
            },
            {
              'id': 'wm_grid',
              'title': 'WM',
              'phases': [
                  {
                      'phaseType': 'TEST', 'type': 'PhaseWorkingMemory',
                      'endCriteriaData': { 'target': {'type': 'CORRECT_TOTAL', 'value': 7}, 'end': {'type': 'INCORRECT_TOTAL', 'value': 5}
                      },
                      'stimuliType': 'WM_3DGRID' // WM_GRID WM_MOVING WM_NUMBERS WM_3DGRID WM_CIRCLE
                  }
              ]
          },

                {
                    'id': 'wm_grid3d',
                    'title': '3D',
                    'phases': [
                        {
                            'type': 'PhaseBase',
                            'phaseType': 'GUIDE',
                            'problemGeneratorData': {
                                'generator': 'ProblemGeneratorBase',
                                'problemProps': {
                                    'correctBeforeNext': true
                                },
                                'problems': [
                                    {
                                        'type': 'WM_3DGRID',
                                        'problemString': '0,3',
                                        'showDemoAnimation': true,
                                        'usePrompt': false,
                                        'gridWidth': 2
                                    },
                                    {
                                        'type': 'WM_3DGRID',
                                        'problemString': '0,1,2,3,4,5,6,7,8,9,10,11,12,13',
                                        'showDemoAnimation': true,
                                        'usePrompt': false,
                                        'gridWidth': 2
                                    }
                                ]
                            }
                        },
                        {
                            'phaseType': 'TEST',
                            'type': 'PhaseWorkingMemory',
                            'endCriteriaData': {
                                'target': { 'type': 'CORRECT_TOTAL', 'value': 7 },
                                'end': { 'type': 'INCORRECT_TOTAL', 'value': 5 }
                            },
                            'stimuliType': 'WM_3DGRID',
                            'problemGeneratorData': {
                                'problemProps': {
                                    'gridWidth': 2
                                }
                            }
                        }
                    ]
                },
                {
                    'title': 'ArrowsSummerTraining',
                    'id': 'ArrowsSummerTraining',
                    'phases': [
                        {
                            'type': 'PhaseArrows',
                            'phaseType': 'TEST',
                            'endCriteriaData': {
                                'target': { 'type': 'CORRECT_TOTAL', 'value': 5 },
                                'end': { 'type': 'TIME', 'value': 30 }
                            },
                            'problemGeneratorData': {
                                'generator': 'ProblemGeneratorArrowsSummerTraining',
                                'problemProps': {
                                    'correctBeforeNext': true
                                }
                            }
                        }
                    ]
                },
                {
                    'phases': [
                        {
                            'phaseType': 'TEST',
                            'type': 'PhaseNVR',
                            'endCriteriaData': {
                                'target': { 'type': 'CORRECT_TOTAL', 'value': 7 },
                                'end': { 'type': 'INCORRECT_TOTAL', 'value': 5 }
                            },
                            'problemFactory': { 'nvr_type': 'Classification' },
                            'stimuliType': 'NVR',
                            'problemGeneratorData': {
                                'problemProps': {
                                    'correctBeforeNext': true, 'useDoneButton': true
                                }
                            } // , "errorHiliteType": "SHOW_ERROR"
                        }
                    ],
                    'id': 'nvr_cl',
                    'title': 'NVR Classification'
                },
                // {
                //     'phases': [
                //         {
                //             'phaseType': 'TEST',
                //             'type': 'PhaseNVR',
                //             'endCriteriaData': {
                //                 'target': { 'type': 'CORRECT_TOTAL', 'value': 7 },
                //                 'end': { 'type': 'INCORRECT_TOTAL', 'value': 5 }
                //             },
                //             'problemFactory': { 'nvr_type': 'RepeatedPatterns' },
                //             'stimuliType': 'NVR',
                //             'problemGeneratorData': { 'problemProps': { 'correctBeforeNext': true, 'useDoneButton': true } }
                //         }
                //     ],
                //     'id': 'nvr_rp',
                //     'title': 'NVR Repeated patterns'
                // },
                // {
                //     'phases': [
                //         {
                //             'phaseType': 'TEST',
                //             'type': 'PhaseNVR',
                //             'endCriteriaData': {
                //                 'target': { 'type': 'CORRECT_TOTAL', 'value': 7 },
                //                 'end': { 'type': 'INCORRECT_TOTAL', 'value': 5 }
                //             },
                //             'problemFactory': { 'nvr_type': 'SequentialOrder' },
                //             'stimuliType': 'NVR',
                //             'problemGeneratorData': { 'problemProps': { 'correctBeforeNext': true, 'useDoneButton': true } }
                //         }
                //     ],
                //     'id': 'nvr_so',
                //     'title': 'NVR SequentialOrder'
                // }
                , {
                    'title': 'Number comparison test 3',
                    'id': 'numberComparison03',
                    'progVisualizer': 'ProgVisualizerSnails',
                    'progVisualizerData': {
                      'progressIndicatorType': 'END',
                      'useExponential': false,
                      'opponentGoalScreenPosition': 1
                    },
                    'phases': [
                      {
                        'type': 'PhaseBase',
                        'phaseType': 'GUIDE',
                        'endCriteriaData': {
                          'target': {
                            'type': 'CORRECT_TOTAL',
                            'value': 4
                          }
                        },
                        'problemGeneratorData': {
                          'problemProps': {
                            'correctBeforeNext': true,
                            'hintCorrect': true,
                            'errorHiliteType': 'SHOW_CORRECT'
                          },
                          'problems': [
                            {
                              'problemString': 'DOT_3,DOT_1',
                              'type': 'VALUE_COMPARISON',
                              'showDemoAnimation': true
                            },
                            {
                              'problemString': 'DOT_4,DOT_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_5,DOT_2',
                              'type': 'VALUE_COMPARISON'
                            }
                          ]
                        }
                      },
                      {
                        'type': 'PhaseBase',
                        'phaseType': 'TEST',
                        'endCriteriaData': {
                          'target': {
                            'type': 'CORRECT_TOTAL',
                            'value': 50
                          },
                          'end': {
                            'type': 'TIME',
                            'value': 180
                          }
                        },
                        'problemGeneratorData': {
                          'problemProps': {
                            'correctBeforeNext': false,
                            'errorHiliteType': 'NONE'
                          },
                          'problems': [
                            {
                              'problemString': 'DOT_5,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_2,DOT_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_3,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_4,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_5,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_6,DOT_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_6,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_3,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_5,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_2,DOT_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_4,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_5,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_4,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_2,DOT_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_3,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_5,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_4,DOT_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'DOT_1,DOT_5',
                              'type': 'VALUE_COMPARISON'
                            }
                          ]
                        }
                      },
                      {
                        'type': 'PhaseBase',
                        'phaseType': 'GUIDE',
                        'endCriteriaData': {
                          'target': {
                            'type': 'CORRECT_TOTAL',
                            'value': 3
                          }
                        },
                        'problemGeneratorData': {
                          'problemProps': {
                            'correctBeforeNext': true,
                            'hintCorrect': true,
                            'errorHiliteType': 'SHOW_CORRECT'
                          },
                          'problems': [
                            {
                              'problemString': 'NUM_2,NUM_4',
                              'type': 'VALUE_COMPARISON',
                              'showDemoAnimation': true
                            },
                            {
                              'problemString': 'NUM_3,NUM_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            }
                          ]
                        }
                      },
                      {
                        'type': 'PhaseBase',
                        'phaseType': 'TEST',
                        'endCriteriaData': {
                          'target': {
                            'type': 'CORRECT_TOTAL',
                            'value': 50
                          },
                          'end': {
                            'type': 'TIME',
                            'value': 180
                          }
                        },
                        'problemGeneratorData': {
                          'problemProps': {
                            'correctBeforeNext': false,
                            'errorHiliteType': 'NONE'
                          },
                          'problems': [
                            {
                              'problemString': 'NUM_3,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_5,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_2,NUM_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_3,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_9,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_8,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_3,NUM_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_2,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_6,NUM_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_3,NUM_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_7,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_7,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_7,NUM_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_8,NUM_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_6,NUM_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_2,NUM_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_7,NUM_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_6,NUM_8',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_6,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_8,NUM_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_5,NUM_8',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_7,NUM_8',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_1,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_2,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_8,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_5,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_9,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_5,NUM_3',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_8',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_9,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_9',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_2,NUM_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_7,NUM_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_4,NUM_1',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_6,NUM_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_6,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_3,NUM_2',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_8,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_3,NUM_8',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_2,NUM_5',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_5,NUM_4',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_9,NUM_8',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_1,NUM_6',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_3,NUM_7',
                              'type': 'VALUE_COMPARISON'
                            },
                            {
                              'problemString': 'NUM_5,NUM_2',
                              'type': 'VALUE_COMPARISON'
                            }
                          ]
                        }
                      }
                    ]
                  }
            ]
        };
    }
}
